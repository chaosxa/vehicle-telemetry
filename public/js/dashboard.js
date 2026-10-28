const $ = (id) => document.getElementById(id);
const token = localStorage.getItem('token');

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.href = '/login.html';
}

if (!token) {
  location.replace('/login.html');
} else {
  init();
}

function init() {
  $('user').textContent = localStorage.getItem('username') || '';
  $('logoutBtn').addEventListener('click', logout);

  const ARC_LEN = Math.PI * 80;
  const MAX_SPEED = 120;

  // Battery segments
  const segs = [];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('span');
    $('segs').appendChild(s);
    segs.push(s);
  }

  const TAGS = {
    OVERHEAT: { label: 'Overheat', cls: 'crit' },
    LOW_BATTERY: { label: 'Low battery', cls: 'warn' },
    OVERSPEED: { label: 'Overspeed', cls: 'warn' },
  };

  function addAlert(a, when) {
    $('empty').style.display = 'none';
    const t = TAGS[a.type] || { label: a.type, cls: 'warn' };
    const li = document.createElement('li');
    li.innerHTML = '<span class="time"></span><span class="tag ' + t.cls + '"></span><span class="msg"></span>';
    li.children[0].textContent = new Date(when).toLocaleTimeString();
    li.children[1].textContent = t.label;
    li.children[2].textContent = a.message;
    $('alerts').prepend(li);
    while ($('alerts').children.length > 10) $('alerts').lastChild.remove();
  }

  function setStatus(live) {
    $('dot').classList.toggle('live', live);
    $('statusText').textContent = live ? 'Live' : 'Reconnecting';
  }

  function render(d) {
    $('vehicle').textContent = d.vehicleId;

    // Speed gauge
    $('speed').textContent = d.speed;
    const frac = Math.min(d.speed / MAX_SPEED, 1);
    $('arc').style.strokeDashoffset = ARC_LEN * (1 - frac);
    $('arc').classList.toggle('over', d.speed > 90);

    // Battery
    $('battery').textContent = d.battery;
    const filled = Math.ceil(d.battery / 10);
    segs.forEach((s, i) => s.classList.toggle('on', i < filled));
    $('segs').classList.toggle('low', d.battery < 20);

    // Temperature
    $('temp').textContent = d.engineTemp;
    const pct = Math.min(Math.max((d.engineTemp - 60) / 60, 0), 1) * 100;
    $('pin').style.left = pct + '%';
    $('tempWrap').classList.toggle('hot', d.engineTemp > 105);

    $('loc').textContent = d.lat.toFixed(4) + ', ' + d.lng.toFixed(4);
  }

  // Chart
  const chart = new Chart($('chart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Speed (km/h)', data: [], borderColor: '#2fa4c7', borderWidth: 2, pointRadius: 0, tension: 0.3 },
        { label: 'Engine temp (°C)', data: [], borderColor: '#d6613f', borderWidth: 2, pointRadius: 0, tension: 0.3 },
      ],
    },
    options: {
      animation: false,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8, color: '#5d6b78' } } },
      scales: {
        x: { ticks: { color: '#5d6b78', maxTicksLimit: 6 }, grid: { display: false } },
        y: { ticks: { color: '#5d6b78' }, grid: { color: '#dde3e8' } },
      },
    },
  });

  // Alert history from the database
  fetch('/api/alerts', { headers: { Authorization: 'Bearer ' + token } })
    .then((res) => (res.status === 401 ? (logout(), []) : res.json()))
    .then((list) => list.slice(0, 5).reverse().forEach((a) => addAlert(a, a.time)));

  // Live stream
  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(proto + '://' + location.host + '/?token=' + encodeURIComponent(token));

    ws.onopen = () => setStatus(true);
    ws.onclose = (e) => {
      setStatus(false);
      if (e.code === 1008) logout();
      else setTimeout(connect, 3000);
    };
    ws.onmessage = (e) => {
      const { reading: d, alerts } = JSON.parse(e.data);
      render(d);

      chart.data.labels.push(new Date(d.time).toLocaleTimeString());
      chart.data.datasets[0].data.push(d.speed);
      chart.data.datasets[1].data.push(d.engineTemp);
      if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets.forEach((ds) => ds.data.shift());
      }
      chart.update();

      alerts.forEach((a) => addAlert(a, Date.now()));
    };
  }
  connect();
}
