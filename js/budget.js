'use strict';

function initBudget(id, token) {
  fetch(`http://localhost:8080/api/budget?budget=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf8',
      'Authorization': token.token
    },
  })
    .then(res => res.json())
    .then(res => {
      const budget = res.data;
      let used = 0;
      let items = [];

      document.querySelector('div#budget > #data').innerHTML = `
        <li>Name:       ${budget.name}</li>
        <li>Comment:    ${budget.comment}</li>
        <li>Created at: ${budget.date}</li>
        <li>Limit:      ${budget.imposedLimit}</li>
        <li>Currency:   ${budget.currencyCode}</li>`;

      for (const role of budget.budgetRoleList) {
        const li = `
          <li>
            <ul>
              <li>Created at: ${role.creationTime}</li>
              <li>Role type:  ${role.roleType}</li>
              <li>Enabled:    ${role.enabled ? 'yes' : 'no'}</li>
              <li>User:       ${role.user.firstName} ${role.user.lastName}</li>
              <li>User email: ${role.user.email}</li>
              ${role.creator != null ? ['<li>Created by: ', role.creator.user.firstName, ' ', role.creator.user.lastName, '</li>'].join('') 
                                     : ''}
            </ul>
          </li>
        `;

        items.push(li);
      }
      
      if (items.length > 0) {
        document.querySelector('div#budget > #roles').innerHTML = items.join('<br>');
      }
      items = [];
      for (const exp of budget.expenditureList) {
        const li = `
        <li>
          <ul>
            <li>Created at: ${exp.creationTime}</li>
            <li>Amount:     ${exp.amount}</li>
            <li>Comment:    ${exp.comment}</li>
            <li>Type:       ${exp.type}</li>
            <li>Created by: ${exp.budgetRole.user.firstName} ${exp.budgetRole.user.lastName}</li>
          </ul>
        </li>
        `;
        
        used += exp.amount;
        items.push(li);
      }

      if (items.length > 0) {
        document.querySelector('div#budget > #expenditures').innerHTML = items.join('<br>');
      }
      document.querySelector('#remaining').innerHTML = `${budget.imposedLimit - used} / ${budget.imposedLimit}`;

      items = [];
      for (const alert of budget.alertList) {
        const li = `
        <li>
          <ul>
            <li>Message:   ${alert.message}</li>
            <li>Priority:  ${alert.priority}</li>
            <li>Active:    ${alert.isActive ? 'yes' : 'no'}</li>
          </ul>
        </li>
        `;
        
        items.push(li);
      }

      if (items.length > 0) {
        document.querySelector('div#budget > #alerts').innerHTML = items.join('<br>');
      }

    })
    .catch(err => {
      alert('Invalid api request.');
      console.log(err);
    })
}

function initUserSelect(id, token) {
  fetch(`http://localhost:8080/api/user?budget=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf8',
      'Authorization': token.token
    },
  })
    .then(res => res.json())
    .then(res => {
      console.log(res.data)
      const items = [];

      for (const user of res.data) {
        const option = `<option value="${user.id}">${user.firstName + ' ' + user.lastName}</option>`;

        items.push(option);
      }

      document.querySelector('#create-role > #users').innerHTML = items.join('');

    })
    .catch(err => {
      alert('Invalid api request.');
      console.log(err);
    })
}

function addEvents(id, token) {
  document.querySelector('#create-role > button').addEventListener('click', e => {
    const usedId = document.querySelector('#create-role > #users').selectedOptions[0].value;
    const type   = document.querySelector('#create-role > #types').selectedOptions[0].value;
    const body = {
      user: {
        id: usedId
      },
      roleType: type
    };

    fetch(`http://localhost:8080/api/role?budget=${id}`, {
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
          initUserSelect(id, token);
          initBudget(id, token);
        }
  
      })
      .catch(err => {
        alert('Invalid api request.');
        console.log(err);
      })
  });

  document.querySelector('#add-expenditure > button').addEventListener('click', e => {
    const type = document.querySelector('#add-expenditure > select').selectedOptions[0].value;
    const comment = document.querySelector('#add-expenditure > input[type=text]').value;
    const amount = document.querySelector('#add-expenditure > input[type=number]').value || 0;


    const body = { type, comment, amount };


    fetch(`http://localhost:8080/api/expenditure?budget=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        'Authorization': token.token
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(res => {
        initBudget(id, token);

        if (res.errorMessages.length > 0) {
          alert(res.errorMessages[0]);
        } else if (res.messages.length > 0) {
          alert(res.messages[0]);
        }
      })
      .catch(err => {
        alert('Invalid api request.');
        console.log(err);
      })
  });

  document.querySelector('#report > button').addEventListener('click', e => {
    const type = document.querySelector('#report > select').selectedOptions[0].value;
 
    fetch(`http://localhost:8080/api/report?budget=${id}&type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        'Authorization': token.token
      },
    })
      .then(res => res.json())
      .then(res => {

        if (res.errorMessages.length > 0) {
          alert(res.errorMessages[0]);
        } else if (res.messages.length > 0) {
          // alert(res.messages[0]);
          if (!res.data.header) {
            document.querySelector('#report > table').innerHTML = 'No data for generating report.'
            return;
          }

          const header = `<tr>${ res.data.header.map(d => `<th>${d}</th>`).join('') }</tr>`
          const rows = res.data.entries.map(entry => {
            return `<tr>${ entry.map(d => `<th>${d}</th>`).join('') }</tr>`;
          });

          document.querySelector('#report > table').innerHTML = `${header} ${rows.join('')}`;
        }
      })
      .catch(err => {
        alert('Invalid api request.');
        console.log(err);
      })
  });
}


window.addEventListener('load', e => {
  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  const token = checkToken();

  if (!id) {
    document.querySelector('h1#no-query').innerHTML = 'No budget was queried';
    return;
  }
  if (!token) {
    return;
  }

  initBudget(id, token);
  initUserSelect(id, token);
  addEvents(id, token);
});
