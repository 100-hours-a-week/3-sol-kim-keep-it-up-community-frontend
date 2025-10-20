import { API_BASE } from './config.js';

export default async function profileUpdateInit() {

    const email = document.querySelector('.email');
    const nicknameInput = document.querySelector('input.nickname');
    const nicknameHelperText = document.querySelector('.helper-text.nickname');

    const updateButton = document.querySelector('.update-button');
    const withdrawalButton = document.querySelector('.delete-account-button')

    const userId = sessionStorage.getItem('userId');
    console.log('userId:', userId);
    
    // 사용자 정보 가져오기
    const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
    });
    const response_json = await response.json();
    console.log(response_json);
    email.textContent = response_json.data.email;
    nicknameInput.value = response_json.data.nickname;

    /*
        EVENT LISTENERS
    */
    /*
        닉네임 수정 유효성 검사
    */
    nicknameInput.addEventListener('input', () => {
        const nickname = nicknameInput.value;
        if (nickname == undefined || nickname.trim() === '') {
            nicknameHelperText.textContent = '닉네임을 입력해주세요.';
        } else if (nickname.length > 10) {
            nicknameHelperText.textContent = '닉네임은 최대 10자까지 가능합니다.';
        } else {
            nicknameHelperText.textContent = '';
            updateButton.disabled = false;
        }
    });

    /*
        회원정보 수정 API
    */
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
                location.href = '/posts/post_list.html';
            }
        } catch (error) {
            alert(error.message);
            updateButton.disabled = false;
        }
    });

    withdrawalButton.addEventListener('click', async (e) => {
        try {
            if (!confirm('회원탈퇴 하시겠습니까?')) return;

            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json();
            if (response.ok) {
                alert('탈퇴 처리 되었습니다.');
                // sessionStorage.setItem('nickname', nickname);
                location.href = '/posts/post_list.html';
            } else {
                console.error(data);
                throw new Error(`회원 탈퇴 중 오류가 발생해 탈퇴 처리가 되지 않았습니다.`);
            }
        } catch (error) {}
    })
}

profileUpdateInit();