import { login, logout } from './login';
import { updateSettings } from './account';

const loginForm = document.getElementById('login');
const logOutBtn = document.querySelector('.nav__el--logout');
const settingsForm = document.getElementById('user-settings');
const passwordsForm = document.getElementById('user-password');

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}

if (settingsForm) {
    settingsForm.addEventListener('submit', async e => {
        e.preventDefault();
        settingsForm.querySelector('.submit-btn').disabled = true;
        settingsForm.querySelector('.submit-btn').innerHTML = "Please wait...";
        const formData = new FormData(settingsForm);
        /* const name = formData.get('name');
        const email = formData.get('email'); */
        await updateSettings(formData, 'data');

        settingsForm.querySelector('.submit-btn').disabled = false;
        settingsForm.querySelector('.submit-btn').innerHTML = "Save settings";
    });
}

if (passwordsForm) {
    passwordsForm.addEventListener('submit', async e => {
        e.preventDefault();
        passwordsForm.querySelector('.submit-btn').disabled = true;
        passwordsForm.querySelector('.submit-btn').innerHTML = "Please wait...";
        const formData = new FormData(passwordsForm);
        const passwordCurrent = formData.get('password-current');
        const password = formData.get('password');
        const passwordConfirm = formData.get('password-confirm');
        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');
        
        passwordsForm.reset();
        passwordsForm.querySelector('.submit-btn').disabled = false;
        passwordsForm.querySelector('.submit-btn').innerHTML = "Save password";
    });
}
