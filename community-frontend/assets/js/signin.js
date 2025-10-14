import { API_BASE } from './config.js';

const form = document.querySelector('form.signinForm');
const btn = form.querySelector('button');

form.addEventListener('submit', async (e) => {
      try {
            console.log('button clicked');
            e.preventDefault();
            btn.disabled = true;
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const response = await fetch(`${API_BASE}/users/signin`, {
                  method: 'POST',    
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                  console.error(data);
                  throw new Error(`비밀번호 또는 이메일이 올바르지 않습니다.`);
            } else {
                  alert('로그인되었습니다.');
                  // sessionStorage.setItem('token', data.token);
                  // sessionStorage.setItem('email', email);
                  // sessionStorage.setItem('id', data.id);
            }
            
            location.href = 'auth/signin.html';
      } catch (err) {
            alert('회원가입 실패: ' + err.message);
      } finally {
            btn.disabled = false;
      }
});
