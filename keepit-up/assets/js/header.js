export default function headerInit() {
    const dropdownButton = document.querySelector('.after-login .dropdown-button');
    const dropdownMenu = document.querySelector('.after-login .dropdown-menu');

    /*
        드롭다운 메뉴
        - 회원정보 수정
        - 비밀번호 변경
        - 로그아웃
    */
    dropdownButton.addEventListener('click', (e) => {

        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
            console.log('dropdown menu closed');
            return;
        } else {
            dropdownMenu.style.display = 'block';
            console.log('dropdown menu opened');
        }
    
    });
}

headerInit();