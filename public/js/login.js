const $ = (id) => document.getElementById(id);

async function submitAuth(mode) {
  const username = $('username').value;
  const password = $('password').value;
  const msg = $('msg');
  msg.textContent = '';

  if (!username || !password) {
    msg.textContent = 'Enter a username and password.';
    return;
  }

  $('loginBtn').disabled = true;
  $('registerBtn').disabled = true;
  try {
    const res = await fetch('/api/auth/' + mode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.error;
      return;
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    location.href = '/index.html';
  } catch {
    msg.textContent = 'Could not reach the server. Check your connection and try again.';
  } finally {
    $('loginBtn').disabled = false;
    $('registerBtn').disabled = false;
  }
}

$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  submitAuth('login');
});
$('registerBtn').addEventListener('click', () => submitAuth('register'));
