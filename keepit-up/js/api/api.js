import { API_BASE } from '../config.js';
import { fetchAPI, fetchAPIWithBody, fetchAPIWithFile } from '../common/api_fetcher.js';

// GET 이용약관, 개인정보처리방침
export function getLegalHTML(type) {
    return fetchAPI(`${API_BASE}/legal/${type}`, 'GET');
}

// POST 회원가입
export function signUp(email, password, nickname) {
    return fetchAPIWithBody(`${API_BASE}/users/signUp`, 'POST', JSON.stringify({ email, password, nickname }));
}

// POST 프로필 사진 등록
export function uploadProfileImage(formData) {
    return fetchAPIWithFile(`${API_BASE}/api/images/signUp/profiles`, 'POST', formData);
}

// POST 로그인
export function signIn(email, password) {
    return fetchAPIWithBody(`${API_BASE}/users/signIn`, 'POST', JSON.stringify({ email, password }));
}

// DELETE 로그아웃
export function signOut() {
    return fetchAPI(`${API_BASE}/users/signOut`, 'DELETE');
}

// POST accessToken 재발급
export async function refreshAccessToken() {
    const response = await fetchAPI(`${API_BASE}/users/refresh`, 'POST');
    
    if (response.status == 401) {
        removeUserIdFromSession();
        window.location.href = '/auth/signin.html';
    }
}

// GET 프로필 이미지 조회
export function getProfileImage() {
    return fetchAPI(`${API_BASE}/api/images/profiles`, 'GET');
}

// PATCH 비밀번호 변경
export function updatePassword(password) {
    return fetchAPIWithBody(`${API_BASE}/users/password`, 'PATCH', JSON.stringify({ password }));
}

// GET 게시글 상세조회
export function getPost(postId) {
    return fetchAPI(`${API_BASE}/posts/detail/${postId}`, 'GET');
}

// GET 게시글 댓글 목록 조회
export function getPostCommentsList(postId) {
    return fetchAPI(`${API_BASE}/posts/${postId}/comments/list`, 'GET');
}

// POST 댓글 등록
export function postComment(postId, contents) {
    return fetchAPIWithBody(`${API_BASE}/posts/${postId}/comments`, 'POST', JSON.stringify({ contents }));
}

// PATCH 댓글 수정
export function updateComment(postId, commentId, updatedContents) {
    return fetchAPIWithBody(`${API_BASE}/posts/${postId}/comments/${commentId}`, 'PATCH', JSON.stringify({ contents: updatedContents }));
}

// DELETE 댓글 삭제
export function deleteComment(postId, commentId) {
    return fetchAPI(`${API_BASE}/posts/${postId}/comments/${commentId}`, 'DELETE');
}

// PATCH 조회수 증가
export function increaseViewCount(postId) {
    return fetchAPI(`${API_BASE}/posts/${postId}/viewcount`, 'PATCH');
}

// GET 좋아요 여부 조회
export function getWhetherLiked(postId) {
    return fetchAPI(`${API_BASE}/posts/${postId}/likes`, 'GET');
}

// POST 게시글 좋아요 등록
export function likePost(postId) {
    return fetchAPI(`${API_BASE}/posts/${postId}/likes`, 'POST');
}

// DELETE 게시글 좋아요 취소
export function cancelPostLike(postId) {
    return fetchAPI(`${API_BASE}/posts/${postId}/likes`, 'DELETE');
}

// DELETE 게시글 삭제
export function deletePost(postId) {
    return fetchAPI(`${API_BASE}/posts/${postId}`, 'DELETE');
}

// POST 게시글 작성
export function postPost(title, contents) {
    return fetchAPIWithBody(`${API_BASE}/posts`, 'POST', JSON.stringify({ title, contents }));
}

// POST 게시글 이미지 등록
export function postPostFile(formData) {
    return fetchAPIWithFile(`${API_BASE}/api/images/posts`, 'POST', formData);
}

// PATCH 게시글 수정
export function updatePost(postId, title, contents) {
    return fetchAPIWithBody(`${API_BASE}/posts/${postId}`, 'PATCH', JSON.stringify({ title, contents }));
}

// PUT 게시글 이미지 변경
export function updatePostFile(postId, formData) {
    return fetchAPIWithFile(`${API_BASE}/api/images/posts/${postId}`, 'PUT', formData);
}

// GET 게시글 목록 조회 (최초 1회)
export function getFirstPostListSlice(size) {
    return fetchAPI(`${API_BASE}/posts/list?size=${size}`, 'GET');
}

// GET 게시글 목록 조회 (2회차 이후)
export function getPostListAfterFirstSlice(cursorId, size) {
    return fetchAPI(`${API_BASE}/posts/list?cursorId=${cursorId}&size=${size}`, 'GET');
}

// GET 사용자 정보 조회
export function getUserProfile() {
    return fetchAPI(`${API_BASE}/users`, 'GET');
}

// PATCH 사용자 정보 수정
export function updateUserProfile(nickname) {
    return fetchAPIWithBody(`${API_BASE}/users`, 'PATCH', JSON.stringify({ nickname }));
}

// PUT 사용자 프로필 사진 수정
export function updateUserProfileImage(formData) {
    return fetchAPIWithFile(`${API_BASE}/api/images/profiles`, 'PUT', formData);
}

// DELETE 회원탈퇴
export function withdraw() {
    return fetchAPI(`${API_BASE}/users`, 'DELETE');
}