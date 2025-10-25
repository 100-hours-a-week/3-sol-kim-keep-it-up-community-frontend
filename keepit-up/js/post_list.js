import { API_BASE } from './config.js';

const postList = document.querySelector('.post-list');
const postCreateButton = document.querySelector('.post-create-button');

const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'

/*
    EVENT LISTENERS
*/
postCreateButton.addEventListener('click', () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        window.location.href = '/posts/post_edit.html';
    } else {
        alert("로그인이 필요한 서비스입니다.");
    }
});

/*
    게시물 목록 API
*/

let cursorId = null;
let isLoading = false; 
let hasNext = true;

async function fetchPostList() {
    // 호출이 마무리가 되기까지는 추가 호출 막기
    if (isLoading) return; 
    // 더 이상 불러올 포스트가 없으면 그만 불러오기
    if (!hasNext) return;
    isLoading = true; 
    
    const size = 5;
    let response = null;

    try {
        // 첫 호출
        if (cursorId == null) {
            response = await fetch(`${API_BASE}/posts?size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
            });
        } else {
            // 두 번째 슬라이스 이상
            response = await fetch(`${API_BASE}/posts?cursorId=${cursorId}&size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
            });
        }

        const response_json = await response.json();
        console.log(response_json);

        const response_size = response_json.data.content.length;
        console.log("response_size", response_size);

        if (response_size != 0) {
            const cursor = response_json.data.content[response_size - 1];
            hasNext = !response_json.data.pageable.last;
            console.log("cursor", cursor);
            console.log('hasNext', hasNext);
            cursorId = cursor.id;

            response_json.data.content.forEach(async post => {
                const image_response = await fetch(`${API_BASE}/images/profiles/${post.writer.id}`, {
                    method: 'GET'
                })

                console.log('image_response', image_response)
                const image_response_json = await image_response.json();
                console.log('image_response_json', image_response_json);

                let url = DEFAULT_IMAGE_PATH;
                if (image_response_json.data) {
                    url = image_response_json.data.url;
                    url = url.startsWith('/') ?
                    `${API_BASE}${url}` : `${API_BASE}/${url}`;
                } 

                console.log('url', url);
                
                postList.innerHTML += `
                <div class = "post-card" id = "${post.id}">
                    <div class = "flex-container column" >
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
                        <img src="${url}" />
                        <h3>${post.writer.nickname}</h3>
                    </div>
                </div>
            `;
                
                const postCard = document.getElementById(`${post.id}`);
                postCard.addEventListener('click', () => {
                    console.log("post clicked");
                    // const postId = p.querySelector('div').id;
                    window.location.href = `/posts/post_detail.html?postId=${post.id}`;
                });
            });
        }
        
        } catch (e) {
        console.error(e);
    } finally {
        isLoading = false;
    }
}

/*
    게시물 상세보기
*/

// function addClickEventListener() {
//     const posts = document.querySelectorAll('.post-card');
//     posts.forEach(post => {
//         post.addEventListener('click', () => {
//             console.log("post clicked");
//             const postId = p.querySelector('div').id;
//             window.location.href = `/posts/post_detail.html?postId=${postId}`;
//         });
//     });
// }


fetchPostList();
// addClickEventListener();

/*
    화면 끝단까지 스크롤 시 게시글 추가 로딩
*/
window.onscroll = function(e) {
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        fetchPostList();
        // addClickEventListener();
    }
};



