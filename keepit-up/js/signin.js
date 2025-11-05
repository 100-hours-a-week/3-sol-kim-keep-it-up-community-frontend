import { isInvalidPassword, isInvalidEmail } from './common/validators.js';
import { API_BASE } from './config.js';
import { AUTH_MESSAGE, MODAL_MESSAGE } from './common/messages.js';
import { setUserIdInSession } from './common/session_managers.js';
import { fetchAPIWithBody } from './common/api_fetcher.js';

export default function signInInit() {

      const form = document.querySelector('form.signin-form'); // form에서 클래스 이름이 signin_form인 요소 선택
      const btn = form.querySelector('button');

      const emailInput = form.querySelector('input.email'); // input에서 클래스 이름이 email인 요소 선택 
      const passwordInput = form.querySelector('input.password');
      const helperText = form.querySelector('.helper-text');

      /*
      FUNCTIONS
      */
      function showAlertModal(content, next_page = null) {
            const commentAlertModal = document.querySelector('.comment-alert-modal');
            const alertContent = commentAlertModal.querySelector('p');
            alertContent.textContent = content;
            commentAlertModal.style.display = 'block';
            const modalConfirmButton = commentAlertModal.querySelector('.modal-confirm-button');
            modalConfirmButton.addEventListener('click', () => {
                  console.log("clicked in signin");
                  commentAlertModal.style.display = 'none';
                  if (next_page) {
                        window.location.href = next_page;
                  }
            })
      }

      function updateButtonState() {
            const password = passwordInput.value;
            const email = emailInput.value;

            if (email == undefined || email.trim() === '') {
                  helperText.textContent = AUTH_MESSAGE.EMAIL_NEEDED;
                  btn.disabled = true;
            } else if (isInvalidEmail(email)) {
                  helperText.textContent = AUTH_MESSAGE.EMAIL_INVALID;
                  btn.disabled = true;
            } else if (password == undefined || password.trim() === '') {
                  helperText.textContent = AUTH_MESSAGE.PASSWORD_NEEDED;
                  btn.disabled = true;
            } else if (isInvalidPassword(password)) {
                  helperText.textContent = AUTH_MESSAGE.PASSWORD_HELPER_TEXT;
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
                  const response = await fetchAPIWithBody(`${API_BASE}/users/signIn`, 'POST', JSON.stringify({ email, password }));
            
                  const response_json = await response.json();
                  if (response.status == 401) {
                        console.error(response_json);
                        showAlertModal(MODAL_MESSAGE.WRONG_PASSWORD_OR_EMAIL);
                  } else if (!response.ok) {
                        console.error(response_json);
                        showAlertModal(MODAL_MESSAGE.SIGNIN_FAILED);
                  } else {
                        console.log('response_json:', response_json);
                        console.log('userId:', response_json.data.id);
                        setUserIdInSession(response_json.data.id);
                        showAlertModal(MODAL_MESSAGE.SIGNIN_SUCCESS, '/posts/post_list.html');
                  }
            } catch (err) {
                  showAlertModal(MODAL_MESSAGE.SIGNIN_FAILED);
            } finally {
                  btn.disabled = false;
            }
      });
}

signInInit();