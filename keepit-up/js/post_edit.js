import { API_BASE } from './config.js';

const postForm = document.querySelector('form.post-edit-form');
const submitButton = document.querySelector('.submit-button');
const titleInput = postForm.querySelector('input.title');
const contentsTextArea = postForm.querySelector('textarea');
const imageInput = document.querySelector('.post-image-input');
const imagePreview = document.querySelector('.post-selected-image-preview');
const helperText = document.querySelector('span.helper-text');
const writerId = sessionStorage.getItem('userId');

let fileUpdated = false;

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

let file;
imageInput.addEventListener("change", () => {
    console.log("new image is selected");
    fileUpdated = true;
    submitButton.disabled = false;

    file = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        console.log("reader loaded a file");
        const dataUrl = reader.result;
        imagePreview.src = dataUrl;
    });

    // reading the contents of the file  
    if (file) {
        console.log("image is read");
        reader.readAsDataURL(file);
    }
})

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

    const imagePrev = document.querySelector('.post-selected-image-preview');
    const url = response_json.data.imageUrl;
    if (url) {
        const image_url = url.startsWith('/') ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
        imagePrev.src = image_url;
    }
} 

/*
    게시글 작성, 수정 API 
*/
submitButton.addEventListener('click', async (e) => {
    console.log('button clicked');
    e.preventDefault();
    submitButton.disabled = true;
    const formData = new FormData(postForm);
    const title = formData.get('title');
    const contents = formData.get('contents');

    let response;
    let response_json;
    if (postId) {
        response = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, contents, writerId }),
        });

        response_json = await response.json();

        if (fileUpdated) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('postId', postId);
            const image_response = await fetch(`${API_BASE}/images/posts/${postId}`, {
                method: 'PUT',
                body: formData
            })

            if (!image_response.ok) {
                showAlertModal('이미지 업로드 중 오류가 발생했습니다. 수정 페이지에서 다시 업로드해주세요.');
            }
        }

    } else {
        response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, contents, writerId }),
        });

        response_json = await response.json();
        const postId = response_json.data.id;

        if (file) {
            console.log('file', file, 'postId', postId);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('postId', postId);
            const image_response = await fetch(`${API_BASE}/images/posts`, {
                method: 'POST',
                body: formData
            })

            // const image_response_json = await image_response.json();
            if (!image_response.ok) {
                showAlertModal('이미지 업로드 중 오류가 발생했습니다. 글 수정에서 다시 업로드해주세요.');
            }
        }
    }

    const data = response_json;
    if (response.status == 400) {
        console.error(data);
        showAlertModal(`모든 항목을 입력해주세요.`);
    } else if (response.ok) {
        const message = postId ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.';
        showAlertModal(message, `/posts/post_detail.html?postId=${data.data.id}`);
    } else {
        console.error(data);
        showAlertModal(`게시글 작성에 실패했습니다.`);
    }
});