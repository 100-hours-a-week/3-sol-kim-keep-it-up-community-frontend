import { API_BASE } from './config.js';

const form = document.querySelector('form.signinForm');
const btn = form.querySelector('button');

const helperText = form.querySelector('.helper-text.password');

helperText.addEventListener('input', () => {
      const password = form.querySelector('input.password').value;
      const email = form.querySelector('input.email').value;

      if (email == undefined || email.trim() === '') {
            helperText.textContent = '이메일을 입력해주세요.';
      } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            helperText.textContent = '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
      } else if (password == undefined || password.trim() === '') {
            helperText.textContent = '비밀번호를 입력해주세요.';
      } else if (password.length < 8 ||
            password.length > 20 ||
            !/[a-z]/.test(password) ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[`~!@#$%^&*()-_=+]/.test(password)) {
            helperText.textContent = '비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      } else {
            helperText.textContent = '';
            btn.disabled = false;
            btn.style.backgroundColor = '#7f6aee'; // 활성화 시 버튼 색상 변경
      }
});

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
            if (response.status == 401) {
                  console.error(data);
                  throw new Error(`아이디 또는 비밀번호를 확인해주세요.`);
            } else if (!response.ok) {
                  console.error(data);
                  throw new Error(`로그인에 실패했습니다.`);
            } else {
                  alert('로그인되었습니다.');
                  // sessionStorage.setItem('token', data.token);
                  // sessionStorage.setItem('profileImage', data.profileImage);
                  // sessionStorage.setItem('email', email);
                  sessionStorage.setItem('id', data.id);
            }
            
            location.href = 'auth/signin.html';
      } catch (err) {
            alert('회원가입 실패: ' + err.message);
      } finally {
            btn.disabled = false;
      }
});
