import { DEFAULT_IMAGE_PATH } from './config.js';
import { isInvalidPassword, isInvalidEmail, isInvalidNickname } from './common/validators.js';
import { AUTH_MESSAGE, MODAL_MESSAGE } from './common/messages.js';
import { getLegalHTML, signUp, storeProfileImageUrlToServer, getPresignedUrl, uploadToS3 } from './api/api.js';

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

      const termsCheckbox = document.getElementById('agreeTerms');
      const privacyCheckbox = document.getElementById('agreePrivacy');

      const legalModal = document.getElementById('legal-modal');
      const legalModalTitle = document.getElementById('legal-title');
      const legalModalContent = document.getElementById('legal-content');
      const legalFrame  = document.getElementById('legal-frame');
      const legalModalCloseButton = document.getElementById('legal-close');
      const legalLinks = document.querySelectorAll('span[data-open]');

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
                  commentAlertModal.style.display = 'none';
                  if (next_page) {
                        window.location.href = next_page;
                  }
            })
      }

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
            
            const agreed = termsCheckbox.checked && privacyCheckbox.checked;

            btn.disabled = !(allFilled && noErrors && agreed);
      }

      /*
      EVENT LISTENERS
      */
      termsCheckbox.addEventListener('change', updateButtonState);
      privacyCheckbox.addEventListener('change', updateButtonState);

      [emailInput, passwordInput, passwordConfirmInput, nicknameInput].forEach(inputElement => inputElement.addEventListener('input', updateButtonState));

      const fileInput = document.querySelector("input[type=file]");

      fileInput.addEventListener("change", previewFile);
      fileInput.style.backgroundImage = `url("${DEFAULT_IMAGE_PATH}")`;

      legalLinks.forEach(a => {
            a.addEventListener('click', () => {
                  const type = a.dataset.open;
                  openLegal(type);
            });
      });

      /*
      FUNCTIONS
      */     
      
      async function openLegal(type) {
            legalModalTitle.textContent = type === 'terms' ? '이용약관' : '개인정보처리방침';

            const response = await getLegalHTML(type);
            const html = await response.text();

            const newDiv = document.createElement('div');
            newDiv.innerHTML = html;
            const body = newDiv.querySelector('main');
            legalModalContent.innerHTML = body.innerHTML; // 본문만 주입

            legalModal.showModal();
            legalModalCloseButton.addEventListener('click', () => {
                  legalModal.close();
            })
      }

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
                  emailHelperText.textContent = AUTH_MESSAGE.EMAIL_NEEDED;
            } else if (isInvalidEmail(email)) {
                  emailHelperText.textContent = AUTH_MESSAGE.EMAIL_INVALID;
            } else {
                  emailHelperText.textContent = '';
            }
      });

      /*
        비밀번호 유효성 검사
      */
      passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            if (isInvalidPassword(password)) {
                  passwordHelperText.textContent = AUTH_MESSAGE.PASSWORD_HELPER_TEXT;
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
                  passwordConfirmHelperText.textContent = AUTH_MESSAGE.PASSWORD_MISMATCH;
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
                  nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_NEEDED;
            } else if (isInvalidNickname(nickname)) {
                  nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_BLANK_ERROR;
            } else if (nickname.length > 10) {
                  nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_HELPER_TEXT;
            } else {
                  nicknameHelperText.textContent = '';
            }
      });

      /*
        회원가입 API
      */
      form.addEventListener('submit', async (e) => {
            console.log('button clicked');
            e.preventDefault();
            btn.disabled = true;
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const nickname = formData.get('nickname');

            const response = await signUp(email, password, nickname);

            if (response.status === 409) {
                  const errorData = await response.json();
                  console.error(errorData);
            
                  if (errorData.message.includes('Email')) {
                        emailHelperText.textContent = AUTH_MESSAGE.EMAIL_CONFLICT;
                  } else if (errorData.message.includes('Nickname')) {
                        nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_CONFLICT;
                  }
            } else if (!response.ok) {
                  const errorData = await response.json();
                  console.error(errorData);
                  showAlertModal(MODAL_MESSAGE.SIGNUP_FAILED);
            } else {
                  const response_json = await response.json();
                  console.log(response_json.data);
                  if (file) {
                        const userId = response_json.data.id;
                        console.log("UserId", userId);
                        console.log(file);
                        const presignedUrl_response = await getPresignedUrl(file.name);// POST presignedUrl 발급
                        if (presignedUrl_response.ok) {
                              const presignedUrl_response_json = await presignedUrl_response.json();
                              console.log(presignedUrl_response_json);
                              const presignedUrl = presignedUrl_response_json.url;
                              const location = presignedUrl_response_json.location;
                              const s3_response = await uploadToS3(presignedUrl, file.type, file);
                              if (s3_response.ok) {
                                    storeProfileImageUrlToServer(location, userId);
                              } else {
                                    console.log(image_response);
                                    showAlertModal(MODAL_MESSAGE.PROFILE_IMAGE_UPLOAD_FAILED);
                              }
                        }
                  }
                  showAlertModal(MODAL_MESSAGE.SIGNUP_SUCCEEDED, '/auth/signin.html');
            }
      });
}

signUpInit();