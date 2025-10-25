import { API_BASE } from './config.js';

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

const userId = sessionStorage.getItem('userId');
console.log('userId:', userId);

/*
    Event Listeners
*/

/*
    게시물 좋아요
*/

postLikeButton.addEventListener('click', async () => {
    console.log('like clicked');
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
        alert("로그인이 필요한 서비스입니다.");
    } else {
        const isLiked = postLikeButton.style.backgroundColor === `var(--blue-disabled)`;
        const likeCountText = postLikeButton.querySelector('.post-likes-count');
        if (isLiked) {
            const response = await fetch(`${API_BASE}/posts/${postId}/likes`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            const json_data = await response.json();
            if (response.ok) {
                postLikeButton.style.backgroundColor = `var(--m-gray)`;
                const prevCount = likeCountText.textContent;
                likeCountText.textContent = String(parseInt(prevCount) - 1);

            } else {
                console.error(json_data);
                throw new Error(`좋아요 취소 중 오류가 발생했습니다.`);
            }

        } else {
            const response = await fetch(`${API_BASE}/posts/${postId}/likes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            const json_data = await response.json();
            if (response.ok) {
                postLikeButton.style.backgroundColor = `var(--blue-disabled)`;
                const prevCount = likeCountText.textContent;
                likeCountText.textContent = String(parseInt(prevCount) + 1);
            } else {
                console.error(json_data);
                throw new Error(`좋아요 등록 중 오류가 발생했습니다.`);
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
            const response = await fetch(`${API_BASE}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
            });
            const data = await response.json();
            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                window.location.href = '/posts/post_list.html';
            } else {
                console.error(data);
                throw new Error(`게시글 삭제에 실패했습니다.`);
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
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
    });
    const response_json = await response.json();
    console.log(response_json);
    return response_json.data;
}

/*
    댓글 목록 API
*/
async function fetchComments() {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
    });
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
            const writerId = userId;

            const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ writerId, contents, postId }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error(data);
                throw new Error(`댓글 작성에 실패했습니다.`);
            } else {
                alert('댓글이 작성되었습니다.');
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
        alert("로그인이 필요한 서비스입니다.");
    }
});
/*
    functions
*/

function autosize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

async function renderPost(post) {
    const postTitle = postSection.querySelector('.post-title');
    const postAuthor = postSection.querySelector('.post-author');
    // const postAuthorImage = postSection.querySelector('.post-author-image');
    const postCreatedAt = postSection.querySelector('.post-created-at');
    const postContent = postSection.querySelector('.post-content');
    const postLikesCount = postSection.querySelector('.post-likes-count');
    const postViewsCount = postSection.querySelector('.post-views-count');
    const postCommentsCount = postSection.querySelector('.post-comments-count');

    postTitle.textContent = post.title;
    postAuthor.textContent = post.writer.nickname;
    // postAuthorImage.src = post.writer.imageUrl;
    postCreatedAt.textContent = post.createdAt;
    postContent.textContent = post.contents;
    postLikesCount.textContent = post.likesCount;
    postViewsCount.textContent = post.viewsCount;
    postCommentsCount.textContent = post.commentsCount;

    if (post.writer.id !== parseInt(userId)) {
        postSection.querySelector('.post-edit-button').style.display = 'none';
        postSection.querySelector('.post-delete-button').style.display = 'none';
    }

    /*
        게시글 이미지
    */
    const post_image_response = await fetch(`${API_BASE}/images/posts/${postId}`, {
        method: 'GET'
    })

    if (post_image_response.ok && post_image_response.status != 204) {
        
        const post_image_response_json = await post_image_response.json();
        const postImage = document.querySelector('.post-image');
        const url = post_image_response_json.data.url;
        console.log('post image url', url);
        const image_url = url.startsWith('/') ?
            `${API_BASE}${url}` : `${API_BASE}/${url}`;
        
        postImage.src = image_url;
    }
} 

async function renderCommentsHTML(comments) {
    commentList.innerHTML = ''
    comments.forEach(async comment => {
        commentList.innerHTML += comment.writer.id === parseInt(userId) ?
            `
                <div class = "comment" id="${comment.id}">
                    <div class = "comment-header flex-container justify-between align-center">
                        <div class = "comment-info flex-container align-center">
                            <img src="${comment.writer.imageUrl}" alt="">
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
                            <img src="${comment.writer.imageUrl}" alt="">
                            <span class = "comment-author">${comment.writer.nickname}</span>
                            <span class = "comment-date">${comment.createdAt}</span>
                        </div>
                    </div>
                    <p class = "comment-contents">${comment.contents}</p>
                </div>`;
        
        /*
            작성자 프로필 이미지 
        */
        const profile_image_response = await fetch(`${API_BASE}/images/profiles/${comment.writer.id}`, {
            method: 'GET'
        })

        const current_comment = document.getElementById(`${comment.id}`);
        const commentAuthorImage = current_comment.querySelector('img');

        if (profile_image_response.status === 204) {
            const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'
            commentAuthorImage.src  = DEFAULT_IMAGE_PATH;
        } else if (profile_image_response.ok) {
            const profile_image_response_json = await profile_image_response.json();
            console.log('profile_image_response_json',comment.id, profile_image_response_json);
            const url = profile_image_response_json.data.url;
            const image_url = url.startsWith('/') ?
                `${API_BASE}${url}` : `${API_BASE}/${url}`;
            
            commentAuthorImage.src = image_url;
        } else {
            // TODO: 에러 처리
        }
    
    });
}

/*
    댓글 수정 버튼
*/
function addEvenListenerToCommentEditButtons() {
    const myCommentsEditButtons = commentList.querySelectorAll('.comment-edit-button');
    myCommentsEditButtons.forEach((editButton, index) => {
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
                    const response = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: updatedContents }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        console.error(data);
                        throw new Error(`댓글 수정에 실패했습니다.`);
                    } else {
                        alert('댓글이 수정되었습니다.');
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
                        const response = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                            },
                        });
                        const data = await response.json();
                        if (response.ok) {
                            alert('댓글이 삭제되었습니다.');
                            commentModal.style.display = 'none';
                            commentList.innerHTML = '';
                            const comments = await fetchComments();
                            renderCommentsHTML(comments);
                            addEvenListenerToCommentEditButtons();
                            addEvenListenerToCommentDeleteButtons();
                        } else {
                            console.error(data);
                            throw new Error(`댓글 삭제에 실패했습니다.`);
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


const views_response = await fetch(`${API_BASE}/posts/${postId}/viewcount`, {
    method: 'PATCH',    
    headers: { 'Content-Type': 'application/json' },
})
const views_response_json = await views_response.json();
console.log('viewcount api', views_response_json);

if (userId) {
    const is_liked_response = await fetch(`${API_BASE}/posts/${postId}/likes/${userId}`, {
        method: 'GET',    
        headers: { 'Content-Type': 'application/json' },
    });
    const is_liked_response_json = await is_liked_response.json();
    console.log('is liked api', is_liked_response_json.data.liked);

    if (is_liked_response_json.data.liked == true) {
        postLikeButton.style.backgroundColor = `var(--blue-disabled)`;
    }
}




fetchPost().then(async post => {
    console.log('post:', post);
    renderPost(post);
    
    const profile_image_response = await fetch(`${API_BASE}/images/profiles/${post.writer.id}`, {
        method: 'GET'
    })

    const postAuthorImage = postSection.querySelector('.post-author-image');

    if (profile_image_response.ok) {
        const profile_image_response_json = await profile_image_response.json();
        console.log('profile_image_response_json', profile_image_response_json);
        const url = profile_image_response_json.data.url;
        const image_url = url.startsWith('/') ?
            `${API_BASE}${url}` : `${API_BASE}/${url}`;
        postAuthorImage.src = image_url;
    } else if (profile_image_response.status === 204) {
        const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'
        postAuthorImage.src  = DEFAULT_IMAGE_PATH;
    } else {
        // TODO: 에러 처리
    }
});

fetchComments().then(comments => {
    console.log('comments:', comments);
    renderCommentsHTML(comments);
    addEvenListenerToCommentEditButtons();
    addEvenListenerToCommentDeleteButtons();
});