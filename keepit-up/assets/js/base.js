import headerInit from './header.js';

import signInInit from './signin.js';
import signUpInit from './signup.js';
import profileUpdateInit from './profile_update.js';
import passwordUpdateInit from './password_update.js';

headerInit();

if (document.querySelector('form.signin_form')) {
    signInInit();
}

if (document.querySelector('form.signup_form')) {
    signUpInit();
}

if (document.querySelector('form.profile_update_form')) {
    profileUpdateInit();
}   

if (document.querySelector('form.password_update_form')) {
    passwordUpdateInit();
}

