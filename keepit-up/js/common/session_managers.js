export function getUserIdFromSession() {
    return sessionStorage.getItem('userId');
}

export function removeUserIdFromSession() {
    sessionStorage.removeItem('userId');
}

export function setUserIdInSession(userId) {
    sessionStorage.setItem('userId', userId);
}
/*
 default export: 한 파일 내에서 단 한 개의 변수, 클래스, 함수만 export 가능. as 키워드 없이 이름 변경 가능
 named export: 한 파일 내에서 여러 개의 변수, 클래스, 함수 export 가능. import할 때 as 키워드 사용해 별칭 지정 가능
*/