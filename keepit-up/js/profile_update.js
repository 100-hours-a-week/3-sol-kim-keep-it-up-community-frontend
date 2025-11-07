import { DEFAULT_IMAGE_PATH } from './config.js';
import { AUTH_MESSAGE, MODAL_MESSAGE } from './common/messages.js';
import { getUserIdFromSession, removeUserIdFromSession } from './common/session_managers.js';
import { handleImageUrl } from './common/image_url_handler.js';
import { refreshAccessToken, getUserProfile, updateUserProfile, updateUserProfileImage, withdraw } from './api/api.js';

export default async function profileUpdateInit() {
    const profileImageInput = document.querySelector('.profile-image-input');
    const email = document.querySelector('.email');
    const nicknameInput = document.querySelector('input.nickname');
    const nicknameHelperText = document.querySelector('.helper-text.nickname');
    const updateButton = document.querySelector('.update-button');
    const userId = getUserIdFromSession();
    console.log('userId:', userId);

    const withdrawalModal = document.querySelector('.withdrawal-modal');

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
    
    /*
        사용자 정보 가져오기
     */
    const response = await getUserProfile();
    
    if (response.status == 401) {
        await refreshAccessToken();
        const profile_response = await getUserProfile();
        if (!profile_response.ok) {
            console.log(profile_response.message);
        }
    } else if (!response.ok) {
        console.log(response);
    }
    
    const response_json = await response.json();
    console.log(response_json);
    email.textContent = response_json.data.email;
    nicknameInput.value = response_json.data.nickname;

    const url = response_json.data.profileImageUrl;
    let profile_image_url = null;
    if (url) {
        profile_image_url = handleImageUrl(url);
    } else {
        profile_image_url = DEFAULT_IMAGE_PATH;
    }
    profileImageInput.style.backgroundImage = `url("${profile_image_url}")`;
    
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
            nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_NEEDED;
        } else if (nickname.length > 10) {
            nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_HELPER_TEXT;
        } else {
            nicknameHelperText.textContent = AUTH_MESSAGE.HELPER_TEXT_MARK;
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

            const response = await updateUserProfile(nickname);

            const data = await response.json();
            if (response.status == 401) {
                await refreshAccessToken();
                const profile_response = await updateUserProfile(nickname);

                if (!profile_response.ok) {
                    console.log(profile_response.message);
                }
            } else if (response.status == 409) {
                nicknameHelperText.textContent = AUTH_MESSAGE.NICKNAME_CONFLICT;
                return;
            } else if (!response.ok) {
                console.error(data);
                showAlertModal(MODAL_MESSAGE.PROFILE_UPDATE_FAILED);
                return;
            } 

            if (file) {
                console.log('file', file, 'userId', userId);
                const formData = new FormData();
                formData.append('file', file);              // File 객체 그대로
                formData.append('userId', String(userId)); 

                const image_response = await updateUserProfileImage(formData);

                if (image_response.status === 401) {
                    await refreshAccessToken();
                    const profile_response = await updateUserProfileImage(formData);

                    if (!profile_response.ok) {
                        console.log(profile_response.message);
                    }
                } else if (!image_response.ok) {
                    console.log(image_response);
                    showAlertModal(MODAL_MESSAGE.PROFILE_IMAGE_UPLOAD_FAILED);
                }
            }
            showAlertModal(MODAL_MESSAGE.PROFILE_UPDATED, '/posts/post_list.html');
        } catch (error) {
            showAlertModal(error.message);
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
        const response = await withdraw();
        const data = await response.json();
        if (response.ok) {
            removeUserIdFromSession();
            withdrawalModal.style.display = 'none';
            showAlertModal(MODAL_MESSAGE.WITHDRAWAL_SUCCEEDED, '/posts/post_list.html');
        } else if (response.status == 401) {
            await refreshAccessToken();
            const response = await withdraw();

            if (!response.ok) {
                console.log(response.message);
            }
        } else {
            console.error(data);
            showAlertModal(MODAL_MESSAGE.WITHDRAWAL_FAILED);
        }
    });
}

profileUpdateInit();