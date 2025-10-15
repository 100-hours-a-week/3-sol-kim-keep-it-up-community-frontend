import { API_BASE } from '../api/config.js';

export default function passwordUpdateInit() {
    const passwordResetForm = document.querySelector('form.password_reset_form');
    const btn = passwordResetForm.querySelector('button.update-button');

    const passwordHelperText = passwordResetForm.querySelector('.helper-text.password');
    const passwordConfirmHelperText = passwordResetForm.querySelector('.helper-text.password-verification');

    const passwordInput = passwordResetForm.querySelector('input.password');
    const passwordConfirmInput = passwordResetForm.querySelector('input.password-verification');

    function updateButtonState() {
        const allFilled =
            passwordInput.value.trim() !== '' &&
            passwordConfirmInput.value.trim() !== '';

        const noErrors =
            passwordHelperText.textContent.trim() === '' &&
            passwordConfirmHelperText.textContent.trim() === '';

        btn.disabled = !(allFilled && noErrors);
    }

    [passwordInput, passwordConfirmInput].forEach(inputElement => inputElement.addEventListener('input', updateButtonState));

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

    passwordConfirmInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        if (password !== passwordConfirm) {
            passwordConfirmHelperText.textContent = '비밀번호가 일치하지 않습니다.';
        } else {
            passwordConfirmHelperText.textContent = '';
        }
    }); 

    passwordResetForm.addEventListener('submit', async (e) => {
        try {
            console.log('button clicked');
            e.preventDefault();
            btn.disabled = true;
            const formData = new FormData(passwordResetForm);
            const password = formData.get('password');
            const userId = sessionStorage.getItem('userId');

            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            if (!response.ok) {
                console.error(data);
                throw new Error(`비밀번호 수정에 실패했습니다.`);
            } else {
                alert('비밀번호가 수정되었습니다. 다시 로그인해주세요.');
                sessionStorage.clear();
                window.location.href = '/auth/signin.html';
            }
        } catch (error) {
            alert(error.message);
            btn.disabled = false;
        }
    });
}

passwordUpdateInit();