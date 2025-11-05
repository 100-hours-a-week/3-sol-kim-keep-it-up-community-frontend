export function isInvalidPassword(password) {
    return password.length < 8 ||
        password.length > 20 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[`~!@#$%^&*()-_=+]/.test(password);
}

export function isInvalidEmail(email) {
    return !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

export function isInvalidNickname(nickname) {
    return !/\s/.test(nickname);
}