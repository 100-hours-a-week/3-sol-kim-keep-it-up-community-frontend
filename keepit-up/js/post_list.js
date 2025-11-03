import { API_BASE } from './config.js';
import { getUserIdFromSession } from './session_manager.js';

const postList = document.querySelector('.post-list');
const postCreateButton = document.querySelector('.post-create-button');

const DEFAULT_IMAGE_PATH = '/assets/images/default_profile_image.png'

/*
    EVENT LISTENERS
*/
postCreateButton.addEventListener('click', () => {
    const userId = getUserIdFromSession();
    if (userId) {
        window.location.href = '/posts/post_edit.html';
    } else {
        showAlertModal("로그인이 필요한 서비스입니다.", '/auth/signin.html');
    }
});

/*
FUNCTIONS
*/
    function showAlertModal(content, next_page = null) {
        const commentAlertModal = document.querySelector('.comment-alert-modal');
        const alertContent = commentAlertModal.querySelector('p');
        alertContent.textContent = content;
        commentAlertModal.style.display = 'block';
        const modalConfirmButton = commentAlertModal.querySelector('.modal-confirm-button');
        modalConfirmButton.addEventListener('click', () => {
                console.log("clicked in signin");
                commentAlertModal.style.display = 'none';
                if (next_page) {
                    window.location.href = next_page;
                }
        })
    }

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
            response = await fetch(`${API_BASE}/posts/list?size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            // 두 번째 슬라이스 이상
            response = await fetch(`${API_BASE}/posts/list?cursorId=${cursorId}&size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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

            response_json.data.content.forEach(post => {

                const image_profile_url = post.writer.profileImageUrl;
                let writer_profile_url = null;
                if (image_profile_url ) {
                    writer_profile_url = image_profile_url .startsWith('/') ?
                    `${API_BASE}${image_profile_url}` : `${API_BASE}/${image_profile_url}`;
                } else {
                    writer_profile_url = DEFAULT_IMAGE_PATH;
                }

                const newPostCard = `
                <div class = "post-card" id = "${post.id}">
                    <div class = "flex-container column" >
                    <div class = "writer-info flex-container justify-between align-center">
                        <div class = "flex-container align-center">
                            <img src="${writer_profile_url}" />
                            <h3 class "post-author">${post.writer.nickname}</h3>
                        </div>
                        <span class ="post-created-at">${post.createdAt}</span>
                    </div>
                        <h2 class = "post-title"><b>${post.title}</b></h2>
                        
                    </div>
                    <hr/>
                    <div class = "post-info flex-container justify-between">
                            <div>
                                <span>좋아요</span> <span>${post.likesCount}</span>
                                <span>댓글</span> <span>${post.commentsCount}</span>
                                <span>조회수</span> <span>${post.viewsCount}</span>
                            </div>
                            
                        </div>
                </div>
                `;  
                postList.insertAdjacentHTML('beforeend', newPostCard);
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

postList.addEventListener('click', (e) => {
    const card = e.target.closest('.post-card');
    if (!card) return;
    const postId = card.id;
    window.location.href = `/posts/post_detail.html?postId=${postId}`;
});

fetchPostList();

/*
    화면 끝단까지 스크롤 시 게시글 추가 로딩
*/
window.onscroll = function(e) {
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        fetchPostList();
    }
};