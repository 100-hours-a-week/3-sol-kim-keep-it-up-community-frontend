import { API_BASE } from './config.js';

const form = document.querySelector('form.signinForm');
const btn = form.querySelector('button');

form.addEventListener('submit', async (e) => {
      e.preventDefault();
    console.log('button clicked');
});

/*
try {
        console.log('button clicked');
        e.preventDefault();
        btn.disabled = true;
        const formData = new FormData(form);
        await fetch(`${API_BASE}/users/signin`, { method: 'POST', body: formData });
        alert('로그인 성공');
        location.href = 'auth/signin.html';
  } catch (err) {
        alert('회원가입 실패: ' + err.message);
  } finally {
        btn.disabled = false;
  }*/