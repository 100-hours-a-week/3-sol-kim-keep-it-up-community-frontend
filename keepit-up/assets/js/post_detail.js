import { API_BASE } from './config.js';

const postDetailSection = document.querySelector('.post-detail-section');
const postSection = postDetailSection.querySelector('.post-section');
const commentsSection = postDetailSection.querySelector('.comments-section');
const commentForm = commentsSection.querySelector('form.comment-form');
const commentList = commentsSection.querySelector('.comments-list');

const postEditButton = postSection.querySelector('.post-edit-button');
const postDeleteButton = postSection.querySelector('.post-delete-button');

/*
 Event Listeners
*/
postEditButton.addEventListener('click', () => {
    const postId = new URLSearchParams(window.location.search).get('postId');
    window.location.href = `/posts/post_edit.html?postId=${postId}`;
});

postDeleteButton.addEventListener('click', async () => {
    try {
        const postId = new URLSearchParams(window.location.search).get('postId');
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
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

/*
    Main Logic
*/
const postId = new URLSearchParams(window.location.search).get('postId');
console.log('postId:', postId);

const userId = sessionStorage.getItem('userId');
console.log('userId:', userId);

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

function renderPost(post) {
    const postTitle = postSection.querySelector('.post-title');
    const postAuthor = postSection.querySelector('.post-author');
    const postAuthorImage = postSection.querySelector('.post-author-image');
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
} 

function renderComments(comments) {
    comments.forEach(comment => {
        commentList.innerHTML +=
            `
                <div class = "post-comment">
                    <div id=${comment.id}">
                        <img src="${comment.writer.imageUrl}" alt="">
                        <span class = "comment-author">${comment.writer.nickname}</span>
                        <span class = "comment-date">${comment.createdAt}</span>
                        <button class = "comment-edit-button">수정</button>
                        <button class = "comment-delete-button">삭제</button>
                    </div>
                    <p class = "comment-contents">${comment.contents}</p>
                </div>`;
        
        // 댓글 작성자일 때만 수정, 삭제 버트 보이도록. 
        if (comment.writer.id !== parseInt(userId)) {
            commentList.querySelector('.comment-edit-button').style.display = 'none';
            commentList.querySelector('.comment-delete-button').style.display = 'none';
        }

        /*
            댓글 수정 이벤트 리스너
        */
        const myCommentsEditButtons = commentList.querySelectorAll('.comment-edit-button');
        myCommentsEditButtons.forEach((editButton, index) => {
            editButton.addEventListener('click', () => {
                console.log('수정 버튼 클릭 됨');
                const commentContents = commentList.querySelectorAll('.comment-contents')[index];
                const originalContents = commentContents.textContent;
                commentContents.innerHTML =
                    `<textarea class="edit-comment-textarea">${originalContents}</textarea>
                <button class="save-comment-button">저장</button>
                <button class="cancel-comment-button">취소</button>`;

                const saveButton = commentContents.querySelector('.save-comment-button');
                const cancelButton = commentContents.querySelector('.cancel-comment-button');
                const editTextarea = commentContents.querySelector('.edit-comment-textarea');

                saveButton.addEventListener('click', async () => {
                    try {
                        const updatedContents = editTextarea.value;
                        const response = await fetch(`${API_BASE}/posts/${postId}/comments/${comment.id}`, {
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
                            commentList.innerHTML = '';
                            const comments = await fetchComments();
                            renderComments(comments);
                        }
                    } catch (error) {
                        console.error(error);
                        alert(error.message);
                    }
                });
            
                cancelButton.addEventListener('click', () => {
                    commentContents.textContent = originalContents;
                });
            });
        });
        /*
            댓글 삭제 이벤트 리스너
       */
        const myCommentsDeleteButtons = commentList.querySelectorAll('.comment-delete-button');
        myCommentsDeleteButtons.forEach((deleteButton, index) => {
            deleteButton.addEventListener('click', async () => {
                console.log('삭제 버튼 클릭 됨');

                if (!confirm('정말로 댓글을 삭제하시겠습니까?')) return;

                try {
                    const response = await fetch(`${API_BASE}/posts/${postId}/comments/${comment.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                        },
                    });
                    const data = await response.json();
                    if (response.ok) {
                        alert('댓글이 삭제되었습니다.');
                        commentList.innerHTML = '';
                        const comments = await fetchComments();
                        renderComments(comments);
                    } else {
                        console.error(data);
                        throw new Error(`댓글 삭제에 실패했습니다.`);
                    }
                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            });
        });
        
    });
    
}
commentForm.addEventListener('submit', async (e) => {
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
            renderComments(comments);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

const response = await fetch(`${API_BASE}/posts/${postId}/viewcount`, {
    method: 'PATCH',    
    headers: { 'Content-Type': 'application/json' },
})
const response_json = await response.json();
console.log(response_json);

fetchPost().then(post => {
    console.log('post:', post);
    renderPost(post);
});

fetchComments().then(comments => {
    console.log('comments:', comments);
    renderComments(comments);
});