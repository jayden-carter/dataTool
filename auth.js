// auth.js
let isLogin = true;

function toggleAuth(mode) {
  isLogin = (mode === 'login');
  document.getElementById('nameField').classList.toggle('hidden', isLogin);
  document.querySelectorAll('#authToggle button')[0].classList.toggle('text-blue-500', isLogin);
  document.querySelectorAll('#authToggle button')[1].classList.toggle('text-blue-500', !isLogin);
  document.getElementById('authMessage').classList.add('hidden');
}

document.getElementById('authForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name')?.value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const users = JSON.parse(localStorage.getItem('users')) || {};

  if (isLogin) {
    if (users[email] && users[email].password === password) {
      localStorage.setItem('loggedInUser', JSON.stringify(users[email]));
      window.location.href = 'index.html'; // Redirect to dashboard
    } else {
      showMessage('Invalid email or password');
    }
  } else {
    if (users[email]) {
      showMessage('User already exists');
    } else {
      users[email] = { name, email, password };
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('loggedInUser', JSON.stringify(users[email]));
      window.location.href = 'index.html'; // Redirect to dashboard
    }
  }
});

function showMessage(msg) {
  const messageEl = document.getElementById('authMessage');
  messageEl.innerText = msg;
  messageEl.classList.remove('hidden');
}
