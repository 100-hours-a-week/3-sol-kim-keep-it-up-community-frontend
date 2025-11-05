import { isInvalidPassword } from './common/validators.js';
import { API_BASE } from './config.js';
import { AUTH_MESSAGE, MODAL_MESSAGE } from './common/messages.js';
import { getUserIdFromSession, removeUserIdFromSession } from './common/session_managers.js';

export default function passwordUpdateInit() {
    const passwordUpdateForm = document.querySelector('form.password-update-form');
    const btn = passwordUpdateForm.querySelector('button.update-button');

    const passwordHelperText = passwordUpdateForm.querySelector('.helper-text.password');
    const passwordConfirmHelperText = passwordUpdateForm.querySelector('.helper-text.password-verification');

    const passwordInput = passwordUpdateForm.querySelector('input.password');
    const passwordConfirmInput = passwordUpdateForm.querySelector('input.password-verification');

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

    /*
        유효성 검사 통과 시 버튼 활성화
    */
    function updateButtonState() {
        const allFilled =
            passwordInput.value.trim() !== '' &&
            passwordConfirmInput.value.trim() !== '';

        const noErrors =
            passwordHelperText.textContent.trim() === '' &&
            passwordConfirmHelperText.textContent.trim() === '';

        btn.disabled = !(allFilled && noErrors);
    }

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
        updateButtonState();
    });

    /*
        비밀번호 일치 여부 확인
    */
    passwordConfirmInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        if (password !== passwordConfirm) {
            passwordConfirmHelperText.textContent = AUTH_MESSAGE.PASSWORD_MISMATCH;
        } else {
            passwordConfirmHelperText.textContent = '';
        }
        updateButtonState();
    }); 

    /*
        비밀번호 변경 API 연결
    */
    passwordUpdateForm.addEventListener('submit', async (e) => {
        try {
            console.log('button clicked');
            e.preventDefault();
            btn.disabled = true;
            const formData = new FormData(passwordUpdateForm);
            const password = formData.get('password'); // 인풋 필드가 name="password"를 가져야 한다. 

            const userId = getUserIdFromSession();

            const response = await fetch(`${API_BASE}/users/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
                credentials: 'include'
            });

            const data = await response.json();
            if (!response.ok) {
                console.error(data);
                showAlertModal(MODAL_MESSAGE.PASSWORD_UPDATE_FAILED);
            } else if (response.status == 401) {
                const response = await fetch(`${API_BASE}/users/refresh`, {
                    method: 'POST',
                    credentials: 'include', 
                });
                
                if (response.status == 401) {
                    removeUserIdFromSession();
                    window.location.href = '/auth/signin.html';
                }

                const password_update_response = await fetch(`${API_BASE}/users/password`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                    credentials: 'include'
                });
            } else {
                showAlertModal(MODAL_MESSAGE.PASSWORD_UPDATED, '/auth/signin.html');
                sessionStorage.clear();
            }
        } catch (error) {
            alert(error.message);
            btn.disabled = false;
        }
    });
}

passwordUpdateInit();