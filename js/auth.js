'use strict';

window.onload = e => {
  if (checkToken()) {
    console.log('Will redirect to application page.');
    window.location.href = '/app.html'
  }
  console.log('User not authenticated')
}

document.querySelector('#login-form').addEventListener('submit', e => {
  e.preventDefault();

  if (checkToken()) {
    alert('Already logged in. Sign out first.')
    redirect('/app.html');
  }

  const email    = document.querySelector('#login-form > input[name=email]').value;
  const password = document.querySelector('#login-form > input[name=password]').value;

  if (!email || !password) {
    alert('Invalid login credentials.');
    return;
  }

  console.log(email, password);
  fetch('http://localhost:8080/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf8'
    },
    body: JSON.stringify({email, password})
  })
    .then(res => res.json())
    .then(res => {
      if (!res.data) {
        alert(res.errorMessages[0]);
        return;
      }
      
      localStorage.setItem('auth', JSON.stringify(res.data));
      redirect('/app.html');

    })
    .catch(err => {
      alert('Invalid login request.');
      console.log(err);
    })
}, false);