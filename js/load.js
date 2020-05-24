
function addAuthCheckAtLoad() {
  if (!checkToken()) {
    window.location.href = '/'
    return;
  }
}

function addWelcomeAtLoad() {
  if (checkToken()) {
    const token = JSON.parse(localStorage.getItem('auth'))
    const email = token.userEmail;
    const p = document.createElement('p');

    p.innerHTML = `Welcome <b>${email}</b>`
    document.body.prepend(p);
  }
}

function addSignoutAtLoad() {
  const btn = document.createElement('button');

  btn.innerHTML = 'Sign out';
  btn.addEventListener('click', e => {
    const token = JSON.parse(localStorage.getItem('auth')).token;

    fetch('http://localhost:8080/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        'Authorization': token
      },
    })
      .then(res => res.json())
      .then(res => {
        localStorage.removeItem('auth');
        redirect('/');
      })
      .catch(err => {
        alert('Invalid logout request.');
        console.log(err);
      })
  });
  document.body.prepend(btn);
}

window.addEventListener('load', e => {
  addAuthCheckAtLoad();
  addWelcomeAtLoad();
  addSignoutAtLoad();
})