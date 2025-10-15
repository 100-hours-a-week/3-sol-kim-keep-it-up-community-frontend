export default function headerInit() {
    const dropdownButton = document.querySelector('.after-login .dropdown-button');
    const dropdownMenu = document.querySelector('.after-login .dropdown-menu');

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