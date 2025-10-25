import { API_BASE } from './config.js';

export default async function profileUpdateInit() {
    const profileImageInput = document.querySelector('.profile-image-input');
    const email = document.querySelector('.email');
    const nicknameInput = document.querySelector('input.nickname');
    const nicknameHelperText = document.querySelector('.helper-text.nickname');
    const updateButton = document.querySelector('.update-button');
    const userId = sessionStorage.getItem('userId');
    console.log('userId:', userId);

    const withdrawalModal = document.querySelector('.withdrawal-modal');
    
    let bothModified = false;

    /*
        프로필 이미지 외 사용자 정보 가져오기
     */
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
        프로필 이미지 불러오기
    */
    const profile_image_response = await fetch(`${API_BASE}/images/profiles/${userId}`, {
        method: 'GET'
    });

    const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'
    const profile_image_response_json = await profile_image_response.json();
    console.log('profile_image_response_json', profile_image_response_json);

    if (profile_image_response_json.data) {
        const url = profile_image_response_json.data.url;
        console.log('url', url);
        const image_url = url.startsWith('/') ?
            `${API_BASE}${url}` : `${API_BASE}/${url}`;
        profileImageInput.style.backgroundImage = `url("${image_url}")`;
    } else {
        profileImageInput.style.backgroundImage = `url("${DEFAULT_IMAGE_PATH}")`;
    }
    
    let file;
    // 사진 선택하면 선택한 사진으로 변경 
    profileImageInput.addEventListener("change", () => {
        console.log("new image is selected");
        file = profileImageInput.files[0];
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            console.log("reader loaded a file");
            const dataUrl = reader.result;
            profileImageInput.style.backgroundImage = `url('${dataUrl}')`;
        });

        // reading the contents of the file  
        if (file) {
            console.log("image is read");
            reader.readAsDataURL(file);
            if (nicknameHelperText.textContent == '*helper-text') {
                updateButton.disabled = false;
            }
        }
    })
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
            nicknameHelperText.textContent = '*helper-text';
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

                if (file) {
                    console.log('file', file, 'userId', userId);
                    const formData = new FormData();
                    formData.append('file', file);              // File 객체 그대로
                    formData.append('userId', String(userId)); 
                    const image_response = await fetch(`${API_BASE}/images/profiles`, {
                        method: 'PUT',
                        body: formData
                    });


                    if (!image_response.ok) {
                        console.log(image_response);
                        // const image_response_json = await image_response.json();
                        // console.log(image_response_json);
                        alert("프로필 사진 업로드 중 에러가 발생했습니다. 다시 업로드 해주세요.");
                    }
                }

                alert('회원정보가 수정되었습니다.');
                // sessionStorage.setItem('nickname', nickname);
                location.href = '/posts/post_list.html';
            }
        } catch (error) {
            alert(error.message);
            updateButton.disabled = false;
        }
    });

    const withdrawalButton = document.querySelector('.delete-account-button');

    withdrawalButton.addEventListener('click', async (e) => {
        console.log("withdrawal button clicked");
        withdrawalModal.style.display = 'block';
    })

    const cancelButton = withdrawalModal.querySelector('.modal-cancel-button');
    const confirmButton = withdrawalModal.querySelector('.modal-confirm-button');

    console.log('cancelButton', cancelButton);
    console.log('confirmButton', confirmButton);
    
    cancelButton.addEventListener('click', () => {
        console.log("cancel button clicked");
        withdrawalModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', async () => {
        console.log("confirm button clicked");
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json();
        if (response.ok) {
            alert('탈퇴 처리 되었습니다.');
            // sessionStorage.setItem('nickname', nickname);
            sessionStorage.removeItem('userId');
            withdrawalModal.style.display = 'none';
            location.href = '/posts/post_list.html';
        } else {
            console.error(data);
            throw new Error(`회원 탈퇴 중 오류가 발생해 탈퇴 처리가 되지 않았습니다.`);
        }
    });
    
}

profileUpdateInit();