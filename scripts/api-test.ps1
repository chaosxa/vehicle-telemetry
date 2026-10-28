# Quick API check. Start the server first (npm start), then run in PowerShell:
#   .\scripts\api-test.ps1
#   .\scripts\api-test.ps1 -BaseUrl https://your-app.onrender.com
param([string]$BaseUrl = "http://localhost:3000")

$script:pass = 0
$script:fail = 0

function Call($Method, $Path, $Body = $null, $Token = $null) {
  $headers = @{}
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  $params = @{ Method = $Method; Uri = "$BaseUrl$Path"; Headers = $headers; UseBasicParsing = $true }
  if ($Body) { $params.ContentType = "application/json"; $params.Body = ($Body | ConvertTo-Json) }
  try {
    $r = Invoke-WebRequest @params
    return @{ Status = [int]$r.StatusCode; Body = ($r.Content | ConvertFrom-Json) }
  } catch {
    if ($_.Exception.Response) { return @{ Status = [int]$_.Exception.Response.StatusCode; Body = $null } }
    throw
  }
}

function Check($Name, $Actual, $Expected) {
  if ($Actual -eq $Expected) { Write-Host "PASS  $Name ($Actual)" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "FAIL  $Name (got $Actual, expected $Expected)" -ForegroundColor Red; $script:fail++ }
}

$user = "tester" + (Get-Random -Maximum 99999)
$pass = "test1234"

Check "Health check"                     (Call GET "/api/health").Status 200

$reg = Call POST "/api/auth/register" @{ username = $user; password = $pass }
Check "Register new user"                $reg.Status 201
Check "Register duplicate user"          (Call POST "/api/auth/register" @{ username = $user; password = $pass }).Status 409
Check "Register short password"          (Call POST "/api/auth/register" @{ username = "x$user"; password = "123" }).Status 400
Check "Login wrong password"             (Call POST "/api/auth/login" @{ username = $user; password = "wrong" }).Status 401

$login = Call POST "/api/auth/login" @{ username = $user; password = $pass }
Check "Login correct password"           $login.Status 200
$token = $login.Body.token

Check "Diagnostics known code (public)"  (Call GET "/api/diagnostics/P0300").Status 200
Check "Diagnostics unknown code"         (Call GET "/api/diagnostics/ZZZZ").Status 404

Check "Alerts without token"             (Call GET "/api/alerts").Status 401
Check "Readings without token"           (Call GET "/api/readings").Status 401

Start-Sleep -Seconds 3   # let the simulator save a few readings
Check "Readings list"                    (Call GET "/api/readings?limit=3" $null $token).Status 200
Check "Latest reading"                   (Call GET "/api/readings/latest" $null $token).Status 200
Check "Stats"                            (Call GET "/api/stats" $null $token).Status 200
Check "Alerts list"                      (Call GET "/api/alerts" $null $token).Status 200

Check "Create fault"                     (Call POST "/api/faults" @{ vehicleId = "VEH-001"; code = "P0300" } $token).Status 201
Check "Create fault missing field"       (Call POST "/api/faults" @{ vehicleId = "VEH-001" } $token).Status 400
Check "Create fault unknown code"        (Call POST "/api/faults" @{ vehicleId = "VEH-001"; code = "ZZZZ" } $token).Status 404
Check "Fault history"                    (Call GET "/api/faults/VEH-001" $null $token).Status 200

Write-Host ""
Write-Host "$script:pass passed, $script:fail failed"
