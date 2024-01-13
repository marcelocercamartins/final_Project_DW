async function login() {
    const name = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const userObj = { username: name, password: password};

    const answer = await makeRequest("http://localhost:8003/login", {
        method: "POST",
        body: JSON.stringify(userObj),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    json = await answer.json();
    switch (answer.status) {
        case 200:
            {
                // login ok
                localStorage.setItem("token", json.token);
                localStorage.setItem("login", true);
                localStorage.setItem("activeUser", name);
                document.getElementById("returnMessage").innerHTML = "";
                window.location.href = "index.html"; //redireciona para a página principal
                break;
            }
        default:
            {
                // Erro detetado
                document.getElementById("returnMessage").innerHTML = json.msg;
                break;
            }
    }
}


async function signUp() {
    const email = document.getElementById("email").value;
    const name = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    document.getElementById("returnMessage").innerHTML = "";

    const userObj = {username: name, password: password, email: email, };

    const answer = await makeRequest("http://localhost:8003/signUp", {
        method: "POST",
        body: JSON.stringify(userObj),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    json = await answer.json();

    switch (answer.status) {
        case 201:
            {
                // Utilizador registado
                document.getElementById("returnMessage").innerHTML = json.msg;
                window.location.href = "index.html";
                break;
            }
        default:
            {
                // Erro detetado
                document.getElementById("returnMessage").innerHTML = json.msg;
                break;
            }
    }
}


function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("login");
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
}


async function makeRequest(url, options) {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (err) {
        console.log(err);
    }
}


function renderPageAfterLoadHtmlElements() {
    const login = localStorage.getItem("login")
    if (login == "true") {
      document.getElementById("login").style.display = 'none';
      document.getElementById("signup").style.display = 'none';

      const userName = localStorage.getItem("activeUser");
      document.getElementById("activeUser").style.display = 'block';
      document.getElementById("activeUser_text").innerHTML = "Olá, " + userName;
    
    } else {
      document.getElementById("activeUser").style.display = 'none';
      document.getElementById("login").style.display = 'block';
      document.getElementById("signup").style.display = 'block';
      document.getElementById("myEventsNavBar").style.display = 'none';
    }
  }

