import { API_BASE } from './config.js';

export default function signUpInit() {

      const form = document.querySelector('form.signup_form');
      const btn = form.querySelector('button');

      const emailHelperText = form.querySelector('.helper-text.email');
      const passwordHelperText = form.querySelector('.helper-text.password');
      const passwordConfirmHelperText = form.querySelector('.helper-text.password-verification');
      const nicknameHelperText = form.querySelector('.helper-text.nickname');

      const emailInput = form.querySelector('input.email');
      const passwordInput = form.querySelector('input.password');
      const passwordConfirmInput = form.querySelector('input.password-verification');
      const nicknameInput = form.querySelector('input.nickname');

      function updateButtonState() {
            const allFilled =
                  emailInput.value.trim() !== '' &&
                  passwordInput.value.trim() !== '' &&
                  passwordConfirmInput.value.trim() !== '' &&
                  nicknameInput.value.trim() !== '';

            const noErrors =
                  emailHelperText.textContent.trim() === '' &&
                  passwordHelperText.textContent.trim() === '' &&
                  passwordConfirmHelperText.textContent.trim() === '' &&
                  nicknameHelperText.textContent.trim() === '';

            btn.disabled = !(allFilled && noErrors);
      }

      [emailInput, passwordInput, passwordConfirmInput, nicknameInput].forEach(inputElement => inputElement.addEventListener('input', updateButtonState));

      const fileInput = document.querySelector("input[type=file]");

      fileInput.addEventListener("change", previewFile);
      const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'
      fileInput.style.backgroundImage = `url("${DEFAULT_IMAGE_PATH}")`;

      let file;
      function previewFile() {
            file = fileInput.files[0];
            const reader = new FileReader();

            reader.addEventListener("load", () => {
                  console.log("reader event listener loading");
                  const dataUrl = reader.result;
                  fileInput.style.backgroundImage = `url('${dataUrl}')`;
            });

            if (file) {
                  reader.readAsDataURL(file);
            }
      }

      /*
        이메일 형식 유효성 검사
      */
      emailInput.addEventListener('input', () => {
            const email = emailInput.value;
            if (email == undefined || email.trim() === '') {
                  emailHelperText.textContent = '이메일을 입력해주세요.';
            } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
                  emailHelperText.textContent = '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
            } else {
                  emailHelperText.textContent = '';
            }
      });

      /*
        비밀번호 유효성 검사
      */
      passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            if (password.length < 8 ||
                  password.length > 20 ||
                  !/[a-z]/.test(password) ||
                  !/[A-Z]/.test(password) ||
                  !/[0-9]/.test(password) ||
                  !/[`~!@#$%^&*()-_=+]/.test(password)) {
                  passwordHelperText.textContent = '비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            } else {
                  passwordHelperText.textContent = '';
            }
      });

      /*
        비밀번호 확인
      */
      passwordConfirmInput.addEventListener('input', () => {
            const passwordInput = form.querySelector('input.password').value;
            const passwordConfirmInput = form.querySelector('input.password-verification').value;
            if (passwordInput !== passwordConfirmInput) {
                  passwordConfirmHelperText.textContent = '비밀번호가 다릅니다.';
            } else {
                  passwordConfirmHelperText.textContent = '';
            }
      });

      /*
       닉네임 유효성 검사
      */
      nicknameInput.addEventListener('input', () => {
            const nickname = nicknameInput.value;
            if (nickname == undefined || nickname.trim() === '') {
                  nicknameHelperText.textContent = '닉네임을 입력해주세요.';
            } else if (/\s/.test(nickname)) {
                  nicknameHelperText.textContent = '띄어쓰기를 없애주세요.';
            } else if (nickname.length > 10) {
                  nicknameHelperText.textContent = '닉네임은 최대 10자까지 입력 가능합니다.';
            } else {
                  nicknameHelperText.textContent = '';
            }
      });

      /*
        회원가입 API
      */
      form.addEventListener('submit', async (e) => {
            // try {
                  console.log('button clicked');
                  e.preventDefault();
                  btn.disabled = true;
                  const formData = new FormData(form);
                  const email = formData.get('email');
                  const password = formData.get('password');
                  const nickname = formData.get('nickname');

                  const response = await fetch(`${API_BASE}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, nickname })
                  });


                  if (response.status === 409) {
                        const errorData = await response.json();
                        console.error(errorData);
                  
                        if (errorData.message.includes('Email')) {
                              emailHelperText.textContent = '이미 사용 중인 이메일입니다.';
                        } else if (errorData.message.includes('Nickname')) {
                              nicknameHelperText.textContent = '이미 사용 중인 닉네임입니다.';
                        }
                  } else if (!response.ok) {
                        const errorData = await response.json();
                        console.error(errorData);
                        throw new Error(`회원가입에 실패했습니다`);
                  } else {
                        const response_json = await response.json();
                        console.log(response_json.data);
                        if (file) {
                              const userId = response_json.data.id;
                              const formData = new FormData;
                              formData.append('file', file);
                              formData.append('userId', userId);
                              const image_response = await fetch(`${API_BASE}/images/profiles`, {
                                    method: 'POST',
                                    body: formData
                              });

                              if (!image_response.ok) {
                                    alert("프로필 사진 업로드 중 에러가 발생했습니다. 회원 정보 수정 페이지에서 다시 업로드 해주세요.");
                              }
                        }

                        alert('회원가입되었습니다. 로그인 페이지로 이동합니다.');
                        location.href = '/auth/signin.html';
                  }
            
            // } catch (err) {
            //       alert('회원가입 실패: ' + err.message + err.location);
            // } finally {
            //       btn.disabled = false;
            // }
      });
}

signUpInit();