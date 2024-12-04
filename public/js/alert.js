// type must be either 'success' or 'error
export const showAlert = (type, message, timer = 7) => {
    hideAlert();

    const markeup = `<div class="alert alert--${type}">${message}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markeup);
    
    window.setTimeout( () => {
        hideAlert();
    }, timer * 1000);
}

export const hideAlert = () => {    
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}