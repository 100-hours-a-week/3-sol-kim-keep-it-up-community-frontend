import { API_BASE } from './config.js';

const postList = document.querySelector('.post-list');
const postCreateButton = document.querySelector('.post-create-button');

/*
    EVENT LISTENERS
*/
postCreateButton.addEventListener('click', () => {
    window.location.href = '/posts/post_edit.html';
});

/*
    게시물 목록 API
*/
const response = await fetch(`${API_BASE}/posts`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    },
});

const response_json = await response.json();
console.log(response_json);

response_json.data.forEach(post => {
    postList.innerHTML += `
    <div class = "post-card">
        <div class = "flex-container column" id = "${post.id}">
            <h2 class = "post-title"><b>${post.title}</b></h2>
            <div class = "post-info flex-container justify-between">
                <div>
                    <span>좋아요</span> <span>${post.likesCount}</span>
                    <span>댓글</span> <span>${post.commentsCount}</span>
                    <span>조회수</span> <span>${post.viewsCount}</span>
                </div>
                <span>${post.createdAt}</span>
            </div>
        </div>
        <hr/>
        <div class = "writer-info flex-container justify-start align-center">
            <img src="${post.writer.imageUrl}" />
            <h3>${post.writer.nickname}</h3>
        </div>
    </div>
`;
});

const post = document.querySelectorAll('.post-card');
post.forEach(p => {
    p.addEventListener('click', () => {
        const postId = p.querySelector('div').id;
        window.location.href = `/posts/post_detail.html?postId=${postId}`;
    });
});