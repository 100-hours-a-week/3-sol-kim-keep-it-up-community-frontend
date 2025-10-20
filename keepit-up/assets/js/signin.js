import { API_BASE } from './config.js';

export default function signInInit() {

      const form = document.querySelector('form.signin-form'); // form에서 클래스 이름이 signin_form인 요소 선택
      const btn = form.querySelector('button');

      const emailInput = form.querySelector('input.email'); // input에서 클래스 이름이 email인 요소 선택 
      const passwordInput = form.querySelector('input.password');
      const helperText = form.querySelector('.helper-text');

      function updateButtonState() {
            const password = passwordInput.value;
            const email = emailInput.value;

            if (email == undefined || email.trim() === '') {
                  helperText.textContent = '이메일을 입력해주세요.';
                  btn.disabled = true;
            } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
                  helperText.textContent = '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
                  btn.disabled = true;
            } else if (password == undefined || password.trim() === '') {
                  helperText.textContent = '비밀번호를 입력해주세요.';
                  btn.disabled = true;
            } else if (password.length < 8 ||
                  password.length > 20 ||
                  !/[a-z]/.test(password) ||
                  !/[A-Z]/.test(password) ||
                  !/[0-9]/.test(password) ||
                  !/[`~!@#$%^&*()-_=+]/.test(password)) {
                  helperText.textContent = '비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
                  btn.disabled = true;
            } else {
                  helperText.textContent = '';
                  btn.disabled = false;
            }
      };

      [emailInput, passwordInput].forEach(e => e.addEventListener('input', updateButtonState));

      /*
            로그인 API 
      */
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

                  const response_json = await response.json();
                  if (response.status == 401) {
                        console.error(response_json);
                        throw new Error(`아이디 또는 비밀번호를 확인해주세요.`);
                  } else if (!response.ok) {
                        console.error(response_json);
                        throw new Error(`로그인에 실패했습니다.`);
                  } else {
                        console.log('response_json:', response_json);
                        // sessionStorage.setItem('token', data.token);
                        // sessionStorage.setItem('profileImage', data.profileImage);
                        // sessionStorage.setItem('email', email);
                        console.log('userId:', response_json.data.id);
                        sessionStorage.setItem('userId', response_json.data.id);
                  
                        alert('로그인되었습니다.');
                  }
            
                  location.href = '/posts/post_list.html';
            } catch (err) {
                  alert('로그인 실패: ' + err.message);
            } finally {
                  btn.disabled = false;
            }
      });
}

signInInit();