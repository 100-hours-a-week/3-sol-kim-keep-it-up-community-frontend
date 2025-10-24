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
        alert('로그아웃 되었습니다.');
        location.href = '/auth/signin.html';
    });

    const response = await fetch(`${API_BASE}/images/profiles/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })

    const response_json = await response.json();
    console.log('response json', response_json);
    const image_url = response_json.data.url;
    console.log('image_url', image_url);
    const imageUrl = image_url.startsWith('/')
    ? `${API_BASE}${image_url}`
    : `${API_BASE}/${image_url}`;
    // dropdownButton.style.backgroundImage = `url('${imageUrl}')`;
    dropdownButton.src = `${imageUrl}`;
}

headerInit();