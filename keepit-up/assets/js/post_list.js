import { API_BASE } from './config.js';

const postList = document.querySelector('.post-list');

const reponse = await fetch(`${API_BASE}/posts`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    },
});

const response_json = await reponse.json();
console.log(response_json);

response_json.data.forEach(post => {
    postList.innerHTML += `
    <div class = "post-card">
        <div class = "flex-container column">
            <h1><b>${post.title}</b></h1>
            <div>
                <span>좋아요</span> <span>${post.likesCount}</span>
                <span>댓글</span> <span>${post.commentsCount}</span>
                <span>조회수</span> <span>${post.viewsCount}</span>
            </div>
            <span>작성일</span> <span>${post.createdAt}</span>
        </div>
        <hr/>
        <div>
            <img src="${post.writer.imageUrl}" />
            <p>${post.writer.nickname}</p>
        </div>
    </div>
`;
});