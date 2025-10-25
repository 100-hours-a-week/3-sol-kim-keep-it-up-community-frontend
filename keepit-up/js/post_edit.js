import { API_BASE } from './config.js';

const postForm = document.querySelector('form.post-edit-form');
const submitButton = document.querySelector('.submit-button');
const titleInput = postForm.querySelector('input.title');
const contentsTextArea = postForm.querySelector('textarea');
const helperText = document.querySelector('span.helper-text');
const writerId = sessionStorage.getItem('userId');

/*
    FUNCTIONS
*/
function updateButtonState() {
    const allFilled =
        titleInput.value.trim() !== '' &&
        contentsTextArea.value.trim() !== '';

    submitButton.disabled = !allFilled;
}

function autosize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

/*
    EVENT LISTENERS
*/

/*
    제목 작성
*/
titleInput.addEventListener('input', () => {
    if (titleInput.value.length > 26) { 
        helperText.textContent = '제목은 26자 이내로 작성해주세요.';
    } else {
        helperText.textContent = '*helper-text';
    }
    updateButtonState();
});

/*
    내용 작성
*/
contentsTextArea.addEventListener('input', () => {
    autosize(contentsTextArea);
    updateButtonState();
});

/*
    게시물 수정 초기 화면
*/
const postId = new URLSearchParams(window.location.search).get('postId');

if (postId) {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
    });
    const response_json = await response.json();
    console.log(response_json);
    postForm.querySelector('input.title').value = response_json.data.title;
    postForm.querySelector('textarea.contents').value = response_json.data.contents;
    autosize(contentsTextArea);
} 

/*
    게시글 작성, 수정 API 
*/
submitButton.addEventListener('click', async (e) => {
    try {
        console.log('button clicked');
        e.preventDefault();
        submitButton.disabled = true;
        const formData = new FormData(postForm);
        const title = formData.get('title');
        const contents = formData.get('contents');

        let response;
        if (postId) {
            response = await fetch(`${API_BASE}/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, contents, writerId }),
            });
        } else {
            response = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, contents, writerId }),
            });
        }

        const data = await response.json();
        if (response.status == 400) {
            console.error(data);
            throw new Error(`모든 항목을 입력해주세요.`);
        } else if (response.ok) {
            alert(postId ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');
            window.location.href = `/posts/post_detail.html?postId=${data.data.id}`;
        } else {
            console.error(data);
            throw new Error(`게시글 작성에 실패했습니다.`);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
        submitButton.disabled = false;
    }
});