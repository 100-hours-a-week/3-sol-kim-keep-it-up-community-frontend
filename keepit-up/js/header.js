import { API_BASE } from './config.js';

export default async function headerInit() {
    const header = document.querySelector('header');
    const beforeLoginMenu = header.querySelector('.before-login-menu');
    const afterLoginMenu = header.querySelector('.after-login-menu');

    const dropdownButton = header.querySelector('.after-login-menu .dropdown-button');
    const dropdownMenu = header.querySelector('.after-login-menu .dropdown-menu');

    console.log('beforeLoginMenu', beforeLoginMenu);
    console.log('afterLoginMenu', afterLoginMenu);

    const userId = sessionStorage.getItem('userId');

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
    logoutButton.addEventListener('click', () => {
        console.log("logout button clicked");
        sessionStorage.removeItem('userId');
        showAlertModal('로그아웃 되었습니다.', '/auth/signin.html');
    });

    if (userId) {
        console.log('userID', userId);
        const response = await fetch(`${API_BASE}/images/profiles/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })

        if (response.status === 204) {
            const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'
            dropdownButton.src = DEFAULT_IMAGE_PATH;
        } else if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
        } else {
            const response_json = await response.json();
            console.log('response json', response_json);

            const image_url = response_json.data.url;
            console.log('image_url', image_url);
            const imageUrl = image_url.startsWith('/')
            ? `${API_BASE}${image_url}`
            : `${API_BASE}/${image_url}`;
            dropdownButton.src = `${imageUrl}`;
        }
    }
}

headerInit();