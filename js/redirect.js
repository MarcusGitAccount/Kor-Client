'use strict';

function redirect(href) {
  if (!localStorage.getItem('auth')) {
    window.location.href = '/'
    return;
  }

  window.location.href = href;
}