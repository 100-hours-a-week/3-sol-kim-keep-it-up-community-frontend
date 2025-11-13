import { DEFAULT_IMAGE_PATH } from './config.js';
import { MODAL_MESSAGE } from './common/messages.js';
import { getUserIdFromSession } from './common/session_managers.js';
import { refreshAccessToken } from './api/api.js';
import { increaseViewCount, getWhetherLiked, likePost, cancelPostLike, getPost, getPostCommentsList, postComment, updateComment, deleteComment, deletePost } from './api/api.js';

const postDetailSection = document.querySelector('.post-detail-section');
const postSection = postDetailSection.querySelector('.post-section');
const commentsSection = postDetailSection.querySelector('.comments-section');
const commentForm = commentsSection.querySelector('form.comment-form');
const commentList = commentsSection.querySelector('.comments-list');

const postLikeButton = postSection.querySelector('.likes-count-container');

const postEditButton = postSection.querySelector('.post-edit-button');
const postDeleteButton = postSection.querySelector('.post-delete-button');

const postId = new URLSearchParams(window.location.search).get('postId');
console.log('postId:', postId);

const userId = getUserIdFromSession();
console.log('userId:', userId);

/*
    Event Listeners
*/

/*
    게시물 좋아요
*/

postLikeButton.addEventListener('click', async () => {
    console.log('like clicked');
    if (!userId) {
        showAlertModal(MODAL_MESSAGE.SIGNIN_NEEDED);
    } else {
        const isLiked = postLikeButton.style.backgroundColor === `var(--blue-disabled)`;
        const likeCountText = postLikeButton.querySelector('.post-likes-count');
        if (isLiked) {
            const response = await cancelPostLike(postId);
            const json_data = await response.json();
            if (response.ok) {
                postLikeButton.style.backgroundColor = `var(--m-gray)`;
                const prevCount = likeCountText.textContent;
                likeCountText.textContent = String(parseInt(prevCount) - 1);
            } else if (response.status == 401) {
                await refreshAccessToken();
                const like_cancel_response = await cancelPostLike(postId);

                if (like_cancel_response.ok) {
                    postLikeButton.style.backgroundColor = `var(--m-gray)`;
                    const prevCount = likeCountText.textContent;
                    likeCountText.textContent = String(parseInt(prevCount) - 1);
                } 
            } else {
                console.error(json_data);
                showAlertModal(MODAL_MESSAGE.LIKE_CANCEL_FAILED);
            }
        } else {
            const response = await likePost(postId);
            const json_data = await response.json();
            if (response.ok) {
                postLikeButton.style.backgroundColor = `var(--blue-disabled)`;
                const prevCount = likeCountText.textContent;
                likeCountText.textContent = String(parseInt(prevCount) + 1);
            } else if (response.status == 401) {
                await refreshAccessToken();
                await likePost(postId);
                } else {
                console.error(json_data);
                showAlertModal(MODAL_MESSAGE.LIKE_FAILED);
            }
        }
    }
});

/*
    게시물 수정 버튼
*/
postEditButton.addEventListener('click', () => {
    const postId = new URLSearchParams(window.location.search).get('postId');
    window.location.href = `/posts/post_edit.html?postId=${postId}`;
});

/*
    게시물 삭제 버튼
*/
postDeleteButton.addEventListener('click', async () => {
    try {
        const postId = new URLSearchParams(window.location.search).get('postId');
        console.log('postId in deleteButtonEventLister', postId);
        
        const postModal = document.querySelector('.post-modal');
        postModal.style.display = 'block';

        const cancelButton = postModal.querySelector('.modal-cancel-button');
        cancelButton.addEventListener('click', () => {
            console.log("cancel button clicked");
            postModal.style.display = 'none';
        })

        const confirmButton = postModal.querySelector('.modal-confirm-button');
        confirmButton.addEventListener('click', async () => {
            console.log("confirm button clicked");
            const response = await deletePost(postId);
        
            if (response.ok) {
                showAlertModal(MODAL_MESSAGE.POST_DELETED, '/posts/post_list.html');
            } else if (response.status == 401) {
                await refreshAccessToken();
                await deletePost(postId);
            } else {
                const response_json = await response.json();
                console.error(response_json);
                showAlertModal(MODAL_MESSAGE.POST_DELETE_FAILED);
            }
        })
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

/*
    API 연결
*/
/*
    게시물 API
*/
async function fetchPost() {
    const response = await getPost(postId);
    const response_json = await response.json();
    console.log(response_json);
    return response_json.data;
}

/*
    댓글 목록 API
*/
async function fetchComments() {
    const response = await getPostCommentsList(postId);
    const response_json = await response.json();
    console.log(response_json);
    return response_json.data;
}
/*
    댓글 작성 API
*/
commentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    if (userId) {
        try {
            console.log('button clicked');
            e.preventDefault();
            const formData = new FormData(commentForm);
            const contents = formData.get('contents'); // 인풋 필드가 name="contents"가 있어야 한다.
            console.log('content:', contents);

            const response = await postComment(postId, contents); 
            const data = await response.json();
            if (!response.ok) {
                console.error(data);
                showAlertModal(MODAL_MESSAGE.COMMENT_CREATE_FAILED);
            } else if (response.status == 401) {
                await refreshAccessToken();
                await postComment(postId, contents); 
            } else {
                showAlertModal(MODAL_MESSAGE.COMMENT_CREATED);
                commentForm.reset();
                const comments = await fetchComments();
                renderCommentsHTML(comments);
                addEvenListenerToCommentEditButtons();
                addEvenListenerToCommentDeleteButtons();
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    } else {
        showAlertModal(MODAL_MESSAGE.SIGNIN_NEEDED, '/auth/signin.html');
    }
});

/*
    functions
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

function autosize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

async function renderPost(post) {
    const postTitle = postSection.querySelector('.post-title');
    const postAuthor = postSection.querySelector('.post-author');
    const postAuthorImage = postSection.querySelector('.post-author-image');
    const postCreatedAt = postSection.querySelector('.post-created-at');

    const postImage = postSection.querySelector('.post-image');
    const postContent = postSection.querySelector('.post-content');
    const postLikesCount = postSection.querySelector('.post-likes-count');
    const postViewsCount = postSection.querySelector('.post-views-count');
    const postCommentsCount = postSection.querySelector('.post-comments-count');

    postTitle.textContent = post.title;
    postAuthor.textContent = post.writer.nickname;

    const image_profile_url = post.writer.profileImageUrl;
    let writer_profile_url = null;
    if (image_profile_url) {
        writer_profile_url = image_profile_url;
    } else {
        writer_profile_url = DEFAULT_IMAGE_PATH;
    }
    
    postAuthorImage.src = writer_profile_url;
    postCreatedAt.textContent = post.createdAt;

    const url = post.imageUrl;
    let image_url = null;
    if (url) {
        image_url = url;
    }

    if (image_url) {
        postImage.src = image_url;
    }
    
    postContent.textContent = post.contents;
    postLikesCount.textContent = post.likesCount;
    postViewsCount.textContent = post.viewsCount;
    postCommentsCount.textContent = post.commentsCount;

    if (post.writer.id !== parseInt(userId)) {
        postSection.querySelector('.post-edit-button').style.display = 'none';
        postSection.querySelector('.post-delete-button').style.display = 'none';
    }
} 

async function renderCommentsHTML(comments) {
    commentList.innerHTML = ''
    comments.forEach(async comment => {

        const image_profile_url = comment.writer.profileImageUrl;
        let writer_profile_url = null;
        if (image_profile_url ) {
            writer_profile_url = image_profile_url;
        } else {
            writer_profile_url = DEFAULT_IMAGE_PATH;
        }
        
        commentList.innerHTML += comment.writer.id === parseInt(userId) ?
            `
                <div class = "comment" id="${comment.id}">
                    <div class = "comment-header flex-container justify-between align-center">
                        <div class = "comment-info flex-container align-center">
                            <img src="${writer_profile_url}" alt="">
                            <span class = "comment-author">${comment.writer.nickname}</span>
                            <span class = "comment-date">${comment.createdAt}</span>
                        </div>
                        <div class = "comment-manage flex-container align-center">
                            <button class = "comment-edit-button">수정</button>
                            <button class = "comment-delete-button">삭제</button>
                        </div>
                    </div>
                    <p class = "comment-contents">${comment.contents}</p>
                </div>`
                
            :
            `
                <div class = "comment" id="${comment.id}">
                    <div class = "comment-header flex-container justify-between align-center">
                        <div class = "comment-info flex-container align-center">
                            <img src="${writer_profile_url}" alt="">
                            <span class = "comment-author">${comment.writer.nickname}</span>
                            <span class = "comment-date">${comment.createdAt}</span>
                        </div>
                    </div>
                    <p class = "comment-contents">${comment.contents}</p>
                </div>`;
    });
}

/*
    댓글 수정 버튼
*/
function addEvenListenerToCommentEditButtons() {
    const myCommentsEditButtons = commentList.querySelectorAll('.comment-edit-button');
    myCommentsEditButtons.forEach(editButton => {
        editButton.addEventListener('click', (e) => {
            console.log('수정 버튼 클릭 됨');
            const commentManageContainer = e.target.closest('.comment-manage');
            const deleteButton = commentManageContainer.querySelector('.comment-delete-button');
            deleteButton.style.display = 'none';
            e.target.style.display = 'none';

            const comment = e.target.closest('.comment');
            const commentContents = comment.querySelector('.comment-contents');
            console.log('commentContents',commentContents);
            const originalContents = commentContents.textContent;

            commentContents.innerHTML =
                `<div class ="comment-edit-container flex-container column">
                    <textarea class="edit-comment-textarea">${originalContents}</textarea>
                    <div class = "button-container flex-container justify-end">
                        <button class="save-comment-button">저장</button>
                        <button class="cancel-comment-button">취소</button>
                    </div>
                </div>
            `;

            const commentEditContainer = commentContents.querySelector('.comment-edit-container');
            const saveButton = commentEditContainer.querySelector('.save-comment-button');
            const cancelButton = commentEditContainer.querySelector('.cancel-comment-button');
            const editTextarea = commentEditContainer.querySelector('.edit-comment-textarea');


            autosize(editTextarea);
            editTextarea.addEventListener('input', () => autosize(editTextarea));
            
            /*
                댓글 수정 후 저장 버튼
            */
            saveButton.addEventListener('click', async (e) => {
                try {
                    const updatedContents = editTextarea.value;
                    const commentId = e.target.closest('.comment').id;
                    const response = await updateComment(postId, commentId, updatedContents);
                    const data = await response.json();
                    if (!response.ok) {
                        console.error(data);
                        showAlertModal(MODAL_MESSAGE.COMMENT_UPDATE_FAILED);
                    } else if (response.status == 401) {
                        await refreshAccessToken();
                        await updateComment(postId, commentId, updatedContents);
                    } else {
                        showAlertModal(MODAL_MESSAGE.COMMENT_UPDATED);
                        const comments = await fetchComments();
                        renderCommentsHTML(comments);
                        addEvenListenerToCommentEditButtons();
                        addEvenListenerToCommentDeleteButtons();
                    }
                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            });
            
            /*
                댓글 수정 취소 버튼
            */
            cancelButton.addEventListener('click', () => {
                commentContents.textContent = originalContents;
                deleteButton.style.display = '';
                e.target.style.display = '';
            });
        });
    });
}

/*
    댓글 삭제 버튼
*/
function addEvenListenerToCommentDeleteButtons() {
    const myCommentsDeleteButtons = commentList.querySelectorAll('.comment-delete-button');
    myCommentsDeleteButtons.forEach((deleteButton, index) => {
        deleteButton.addEventListener('click', async (e) => {

            try {
                const commentModal = document.querySelector('.comment-modal');
                commentModal.style.display = 'block';

                const cancelButton = commentModal.querySelector('.modal-cancel-button');
                cancelButton.addEventListener('click', () => {
                    console.log("cancel button clicked");
                    commentModal.style.display = 'none';
                })

                const confirmButton = commentModal.querySelector('.modal-confirm-button');
                confirmButton.addEventListener('click', async () => {
                    try {
                        const commentId = e.target.closest('.comment').id;
                        const response = await deleteComment(postId, commentId);
                        const data = await response.json();
                        if (response.ok) {
                            commentModal.style.display = 'none';
                            showAlertModal(MODAL_MESSAGE.COMMENT_DELETED);
                            commentList.innerHTML = '';
                            const comments = await fetchComments();
                            renderCommentsHTML(comments);
                            addEvenListenerToCommentEditButtons();
                            addEvenListenerToCommentDeleteButtons();
                        } else if (response.status == 401) {
                            await refreshAccessToken();
                            await deleteComment(postId, commentId);
                        } else {
                            console.error(data);
                            showAlertModal(MODAL_MESSAGE.COMMENT_DELETE_FAILED);
                        }
                    } catch (error) {
                        console.error(error);
                        alert(error.message);
                    }
                })
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    });
}

/*
    Main Logic
*/
const view_count_response = await increaseViewCount(postId);
if (view_count_response.ok) {
    const view_count_response_json = await view_count_response.json();
} else {
    console.log(views_response_json.message);
}

if (userId) {
    const is_liked_response = await getWhetherLiked(postId);

    if (is_liked_response.ok) {
        const is_liked_response_json = await is_liked_response.json();
        console.log('is_liked_response_json', is_liked_response_json);
        console.log('is liked api', is_liked_response_json.data.liked);

        if (is_liked_response_json.data.liked == true) {
            postLikeButton.style.backgroundColor = `var(--blue-disabled)`;
        }
    } else if (is_liked_response.status == 401) {
        await refreshAccessToken();
        await getWhetherLiked(postId);
    } 
}

fetchPost().then(async post => {
    console.log('post:', post);
    renderPost(post);
});

fetchComments().then(comments => {
    console.log('comments:', comments);
    renderCommentsHTML(comments);
    addEvenListenerToCommentEditButtons();
    addEvenListenerToCommentDeleteButtons();
});