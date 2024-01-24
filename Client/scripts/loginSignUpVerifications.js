async function validateLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (isEmpty(username, "Username não se encontra preenchido!") ||
        isEmpty(password, "Password não se encontra preenchido!")) {
        return;
    }

    await login();
}

async function validateSignUp() {
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (isEmpty(email, "Email não se encontra preenchido!") ||
        isEmpty(username, "Username não se encontra preenchido!") ||
        isEmpty(password, "Password não se encontra preenchido!")) {
        return;
    }

    if (password.length < 5) {
        document.getElementById("returnMessage").innerHTML = 'Password deve ter 5 ou mais caracteres' ;
        return;
    }

    await signUp();
}


function isEmpty(value, errorMessage) {
    if (value.trim() === "") {
        document.getElementById("returnMessage").innerHTML = errorMessage;
        return true;
    }
    return false;
}