import { DEFAULT_IMAGE_PATH } from './config.js';
import { getUserIdFromSession } from './common/session_managers.js';
import { MODAL_MESSAGE } from './common/messages.js';
import { handleImageUrl } from './common/image_url_handler.js';
import { signOut, refreshAccessToken, getProfileImage } from './api/api.js';

export default async function headerInit() {
    const header = document.querySelector('header');
    const beforeLoginMenu = header.querySelector('.before-login-menu');
    const afterLoginMenu = header.querySelector('.after-login-menu');

    const dropdownButton = header.querySelector('.after-login-menu .dropdown-button');
    const dropdownMenu = header.querySelector('.after-login-menu .dropdown-menu');

    console.log('beforeLoginMenu', beforeLoginMenu);
    console.log('afterLoginMenu', afterLoginMenu);

    const userId = getUserIdFromSession();

    if (!userId) {
        dropdownButton.style.display = 'none';
        beforeLoginMenu.style.display = 'block';
    } else {
        dropdownButton.style.display = 'block';
        beforeLoginMenu.style.display = 'none';
    }

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
        드롭다운 메뉴
        - 회원정보 수정
        - 비밀번호 변경
        - 로그아웃
    */
    dropdownButton.addEventListener('click', (e) => {
        console.log("dropdown menu clicked");
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
            console.log('dropdown menu closed');
            return;
        } else {
            dropdownMenu.style.display = 'block';
            console.log('dropdown menu opened');
        }
    });

    const logoutButton = header.querySelector('.logout-button');
    console.log('logoutbutton',logoutButton)
    logoutButton.addEventListener('click', async () => {
        console.log("logout button clicked");
        sessionStorage.removeItem('userId');

        const response = await signOut();

        if (response.ok) {
            showAlertModal(MODAL_MESSAGE.SIGNED_OUT, '/auth/signin.html');
        } else if (response.status == 401) {
            await refreshAccessToken();
            await signOut();
        } else {
            console.log(response.data.message);
        }
    });

    if (userId) {
        dropdownButton.src = DEFAULT_IMAGE_PATH;
        
        console.log('userID', userId);
        const response = await getProfileImage();
        console.log('response', response);

        if (response.status === 200) {
            const response_json = await response.json();
            console.log('response json', response_json);
            dropdownButton.src = response_json.data.url;

        } else if (response.status == 401) {
            refreshAccessToken();
            const response = getProfileImage();

            if (response.status === 200) {
                const response_json = await response.json();
                console.log('response json', response_json);
                dropdownButton.src = response_json.data.url;
            } 
        } else if (!response.ok) {
            console.error(response);
        } 
    }
}

headerInit();