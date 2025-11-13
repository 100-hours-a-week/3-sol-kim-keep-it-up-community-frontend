import { POST_MESSAGE, MODAL_MESSAGE } from './common/messages.js';
import { getUserIdFromSession } from './common/session_managers.js';
import { handleImageUrl } from './common/image_url_handler.js';
import { getPresignedUrl, uploadToS3, updatePost, updatePostImageUrl, storePostImageUrlToServer, refreshAccessToken, postPost, getPost} from './api/api.js';

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
    let response = await getPost(postId);

    if (response.status === 401) {
        await refreshAccessToken();
        response = await getPost();
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
        imagePrev.src = handleImageUrl(url);
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
        response = await updatePost(postId, title, contents);

        if (response.status == 401) {
            await refreshAccessToken();
            response = await updatePost(postId, title, contents);
        } 

        if (!response.ok) {
            console.log(response.message);
            return;
        }

        response_json = await response.json();
        /*
        게시글 이미지 수정
        */
        if (fileUpdated) {
            const presignedUrl_response = await getPresignedUrl(file.name);// POST presignedUrl 발급
            if (presignedUrl_response.ok) {
                const presignedUrl_response_json = await presignedUrl_response.json();
                const presignedUrl = presignedUrl_response_json.url;
                const location = presignedUrl_response_json.location;
                const s3_response = await uploadToS3(presignedUrl, file.type, file);
                if (s3_response.ok) {
                    const image_response = await updatePostImageUrl(location, postId);
                    
                    if (!image_response.ok) {
                        showAlertModal(MODAL_MESSAGE.POST_IMAGE_UPLOAD_FAILED);
                    } else if (response.status == 401) {
                        await refreshAccessToken();
                        image_response = await updatePostImageUrl(location, postId);

                        if (!image_response.ok) {
                            console.log(image_response.message);
                        }
                    } 
                } else {
                    console.log(image_response);
                    showAlertModal(MODAL_MESSAGE.POST_IMAGE_UPLOAD_FAILED);
                }
            }
        }

    } else {
        /*
        게시글 작성
        */
        response = await postPost(title, contents);
        if (!response.ok) {
            console.log(response);
        }

        if (response.status == 401) {
            await refreshAccessToken();
            response = await postPost(title, contents);

            if (!response.ok) {
                console.log(response.message);
            }
        } 
            response_json = await response.json();
            const postId = response_json.data.id;

        if (file) {
            /*
            게시글 이미지 등록
            */
            console.log('file', file, 'postId', postId);
            // const formData = new FormData();
            // formData.append('file', file);
            // formData.append('postId', postId);

            const presignedUrl_response = await getPresignedUrl(file.name);// POST presignedUrl 발급
            if (presignedUrl_response.ok) {
                const presignedUrl_response_json = await presignedUrl_response.json();
                console.log(presignedUrl_response_json);
                const presignedUrl = presignedUrl_response_json.url;
                const location = presignedUrl_response_json.location;
                const s3_response = await uploadToS3(presignedUrl, file.type, file);
                if (s3_response.ok) {
                    const image_response = await storePostImageUrlToServer(location, postId);
                    
                    if (!image_response.ok) {
                        showAlertModal(MODAL_MESSAGE.POST_IMAGE_UPLOAD_FAILED);
                    } else if (response.status == 401) {
                        await refreshAccessToken();
                        image_response = await storePostImageUrlToServer(location, postId);

                        if (!image_response.ok) {
                            console.log(image_response.message);
                        }
                    } 
                } else {
                    console.log(image_response);
                    showAlertModal(MODAL_MESSAGE.POST_IMAGE_UPLOAD_FAILED);
                }
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