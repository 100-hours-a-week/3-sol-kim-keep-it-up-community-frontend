export const AUTH_MESSAGE = {
    HELPER_TEXT_MARK: '*helper-text',

    EMAIL_NEEDED: '이메일을 입력해주세요.',
    EMAIL_INVALID: '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
    EMAIL_CONFLICT: '이미 사용 중인 이메일입니다.',

    NICKNAME_NEEDED: '닉네임을 입력해주세요.',
    NICKNAME_HELPER_TEXT: '닉네임은 최대 10자까지 가능합니다.',
    NICKNAME_CONFLICT: '이미 존재하는 닉네임입니다.',
    NICKNAME_BLANK_ERROR: '띄어쓰기를 없애주세요.',

    PASSWORD_NEEDED: '비밀번호를 입력해주세요.',
    PASSWORD_HELPER_TEXT: '비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.'
};

export const POST_MESSAGE = {
    TITLE_HELPER_TEXT: '제목은 26자 이내로 작성해주세요.'
}

export const MODAL_MESSAGE = {
    SIGNIN_NEEDED: '로그인이 필요한 서비스입니다.',

    WRONG_PASSWORD_OR_EMAIL: '이메일 또는 비밀번호를 확인해주세요.',
    SIGNIN_SUCCESS: '로그인되었습니다.',
    SIGNIN_FAILED: '로그인에 실패했습니다.',

    SIGNED_OUT: '로그아웃 되었습니다.',
        
    PASSWORD_UPDATE_FAILED: '비밀번호 수정에 실패했습니다.',
    PASSWORD_UPDATED: `비밀번호가 수정되었습니다. 
다시 로그인해주세요.`,
    FILL_OUT_ALL: '모든 항목을 입력해주세요.',

    SIGNUP_FAILED: '회원가입에 실패했습니다.',
    SIGNUP_SUCCEEDED: `     회원가입되었습니다. 
로그인 페이지로 이동합니다.`,

    POST_PUBLISHED: '게시글이 작성되었습니다.',
    POST_UPDATED: '게시글이 수정되었습니다.',
    POST_DELETED: '게시글이 삭제되었습니다.',
    POST_PUBLISHING_FAILED: '게시글 작성에 실패했습니다.',
    POST_DELETE_FAILED: '게시글 삭제에 실패했습니다.',
    POST_IMAGE_UPLOAD_FAILED: '이미지 업로드 중 오류가 발생했습니다. 수정 페이지에서 다시 업로드해주세요.',

    COMMENT_CREATED: '댓글이 작성되었습니다.',
    COMMENT_UPDATED: '댓글이 수정되었습니다.',
    COMMENT_DELETED: '댓글이 삭제되었습니다.',
    COMMENT_CREATE_FAILED: '댓글 작성에 실패했습니다.',
    COMMENT_UPDATE_FAILED: '댓글 수정에 실패했습니다.',
    COMMENT_DELETE_FAILED: '댓글 삭제에 실패했습니다.',

    LIKE_CANCEL_FAILED: '좋아요 취소 중 오류가 발생했습니다.',
    LIKE_FAILED: '좋아요 등록 중 오류가 발생했습니다.',

    PROFILE_UPDATED: '회원정보가 수정되었습니다.',
    PROFILE_IMAGE_UPLOAD_FAILED: `프로필 사진 업로드 중 에러가 발생했습니다. 
다시 업로드 해주세요.`,
    PROFILE_UPDATE_FAILED: '회원정보 수정에 실패했습니다.',

    WITHDRAWAL_SUCCEEDED: '탈퇴 처리 되었습니다.',
    WITHDRAWAL_FAILED: '회원 탈퇴 중 오류가 발생해 탈퇴 처리가 되지 않았습니다.'
}