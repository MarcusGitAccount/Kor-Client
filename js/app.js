
function initRoles(token) {
  fetch('http://localhost:8080/api/role', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf8',
      'Authorization': token.token
    },
  })
    .then(res => res.json())
    .then(res => {
      const ul = document.querySelector('ul#roles') 
      const items = [];

      if (res.data.length == 0) {
        ul.innerHTML = 'You are currently part of no budget.';
        return;
      }

      for (const role of res.data) {
        const li = `
          <li>
            <a href="/budget.html?id=${role.dailyBudget.id}">Budget link</a>
            <ul>
              <li>Created at: ${role.creationTime}</li>
              <li>Role type:  ${role.roleType}</li>
              <li>Enabled:    ${role.enabled ? 'yes' : 'no'}</li>
            </ul>
          </li>
        `;

        items.push(li);
      }

      ul.innerHTML = items.join('<br>');
    })
    .catch(err => {
      alert('Invalid api request.');
      console.log(err);
    })
}

window.addEventListener('load', e => {
  const token = checkToken();

  if (!token) {
    return;
  }

  initRoles(token);

  document.querySelector('#new-budget > input[type=button]').addEventListener('click', e => {
    const name    = document.querySelector('#new-budget > input[name=name]').value;
    const comment = document.querySelector('#new-budget > input[name=comment]').value;
    const imposedLimit    = document.querySelector('#new-budget > input[name=limit]').value;
    const currencyCode    = document.querySelector('#new-budget > select').selectedOptions[0].value;
    const body = { name, comment, imposedLimit, currencyCode };

    fetch(`http://localhost:8080/api/budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        'Authorization': token.token
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(res => {
        if (res.errorMessages.length > 0) {
          alert(res.errorMessages[0]);
        } else if (res.messages.length > 0) {
          alert(res.messages[0]);
          initRoles(token);
        }
      })
      .catch(err => {
        alert('Invalid api request.');
        console.log(err);
      })

  });
});