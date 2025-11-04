import { API_BASE } from './config.js';
import { POST_MESSAGE, MODAL_MESSAGE } from './messages.js';
import { getUserIdFromSession, removeUserIdFromSession } from './session_manager.js';

const postForm = document.querySelector('form.post-edit-form');
const submitButton = document.querySelector('.submit-button');
const titleInput = postForm.querySelector('input.title');
const contentsTextArea = postForm.querySelector('textarea');
const imageInput = document.querySelector('.post-image-input');
const imagePreview = document.querySelector('.post-selected-image-preview');
const helperText = document.querySelector('span.helper-text');
const writerId = getUserIdFromSession();

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
        helperText.textContent = POST_MESSAGE.TITLE_HELPER_TEXT;
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
    let response = await fetch(`${API_BASE}/posts/detail/${postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        const token_response = await fetch(`${API_BASE}/users/refresh`, {
            method: 'POST',
            credentials: 'include', 
        });
        
        if (token_response.status == 401) {
            removeUserIdFromSession();
            window.location.href = '/auth/signin.html';
        }

        response = await fetch(`${API_BASE}/posts/detail/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    if (!response.ok) {
        console.log(response);
    } 

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

    /*
    게시글 수정
    */
    if (postId) {
        response = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, contents }),
            credentials: 'include',
        });

        if (response.status == 401) {
            const token_response = await fetch(`${API_BASE}/users/refresh`, {
                method: 'POST',
                credentials: 'include', 
            });
            
            console.log(token_response);
            if (token_response.status == 401) {
                removeUserIdFromSession();
                window.location.href = '/auth/signin.html';
            }

            response = await fetch(`${API_BASE}/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, contents }),
                credentials: 'include',
            });
        } 

        response_json = await response.json();
        /*
        게시글 이미지 수정
        */
        if (fileUpdated) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('postId', postId);
            const image_response = await fetch(`${API_BASE}/api/images/posts/${postId}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include'
            })

            console.log('image_response', image_response);

            if (!image_response.ok) {
                showAlertModal(MODAL_MESSAGE.IMAGE_UPLOAD_FAILED);
            } else if (image_response.status == 401) {
                const token_response = await fetch(`${API_BASE}/users/refresh`, {
                    method: 'POST',
                    credentials: 'include', 
                });
                
                console.log(token_response);
                if (token_response.status == 401) {
                    removeUserIdFromSession();
                    window.location.href = '/auth/signin.html';
                }

                const image_response = await fetch(`${API_BASE}/api/images/posts/${postId}`, {
                    method: 'PUT',
                    body: formData,
                    credentials: 'include'
                });
            } 
        }

    } else {
        /*
        게시글 작성
        */
        response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, contents, writerId }),
            credentials: 'include',
        });

        if (!response.ok) {
            console.log(response);
        }

        if (response.status == 401) {
            const token_response = await fetch(`${API_BASE}/users/refresh`, {
                method: 'POST',
                credentials: 'include', 
            });
            
            console.log(token_response);
            if (token_response.status == 401) {
                removeUserIdFromSession();
                window.location.href = '/auth/signin.html';
            }

            response = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, contents, writerId }),
                credentials: 'include',
            });
        } 
            response_json = await response.json();
            const postId = response_json.data.id;

        if (file) {
            /*
            게시글 이미지 등록
            */
            console.log('file', file, 'postId', postId);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('postId', postId);
            const image_response = await fetch(`${API_BASE}/api/images/posts`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })

            console.log('image_response', image_response);
            // const image_response_json = await image_response.json();
            if (!image_response.ok) {
                showAlertModal(MODAL_MESSAGE.IMAGE_UPLOAD_FAILED);
            } else if (response.status == 401) {
                const token_response = await fetch(`${API_BASE}/users/refresh`, {
                    method: 'POST',
                    credentials: 'include', 
                });
                
                console.log(token_response);
                if (token_response.status == 401) {
                    removeUserIdFromSession();
                    window.location.href = '/auth/signin.html';
                }

                const image_response = await fetch(`${API_BASE}/api/images/posts`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                })
            } 
        }
    }

    const data = response_json;
    if (response.status == 400) {
        console.error(data);
        showAlertModal(MODAL_MESSAGE.FILL_OUT_ALL);
    } else if (response.ok) {
        const message = postId ? MODAL_MESSAGE.POST_UPDATED : MODAL_MESSAGE.POST_PUBLISHED;
        showAlertModal(message, `/posts/post_detail.html?postId=${data.data.id}`);
    } else {
        console.error(data);
        showAlertModal(MODAL_MESSAGE.POST_PUBLISHING_FAILED);
    }
});