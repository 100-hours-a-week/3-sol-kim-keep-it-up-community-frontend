import { API_BASE } from './config.js';

export default function profileUpdateInit() {

    const email = document.querySelector('.email');
    const nicknameInput = document.querySelector('input.nickname');
    const nicknameHelperText = document.querySelector('.helper-text.nickname');

    const updateButton = document.querySelector('.update-button');

    const userId = localStorage.getItem('userId');
    console.log('userId:', userId);
    
    // 사용자 정보 가져오기
    fetch(`${API_BASE}/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            email.textContent = data.email;
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    nicknameInput.addEventListener('input', () => {
        const nickname = nicknameInput.value;
        if (nickname == undefined || nickname.trim() === '') {
            nicknameHelperText.textContent = '닉네임을 입력해주세요.';
        } else if (nickname.length > 10) {
            nicknameHelperText.textContent = '닉네임은 최대 10자까지 가능합니다.';
        } else {
            nicknameHelperText.textContent = '';
        }
    });

    updateButton.addEventListener('click', async (e) => {
        try {
            console.log('button clicked');
            e.preventDefault();
            updateButton.disabled = true;
            const formData = new FormData();
            const nickname = nicknameInput.value;
            formData.append('nickname', nickname);

            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname }),
            });
            const data = await response.json();
            if (response.status == 409) {
                nicknameHelperText.textContent = '이미 존재하는 닉네임입니다.';
            } else if (!response.ok) {
                console.error(data);
                throw new Error(`회원정보 수정에 실패했습니다.`);
            } else {
                alert('회원정보가 수정되었습니다.');
                // sessionStorage.setItem('nickname', nickname);
            }
        } catch (error) {
            alert(error.message);
            updateButton.disabled = false;
        }
    });
}