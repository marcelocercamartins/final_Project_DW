async function login() {
    const name = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const userObj = { username: name, password: password};

    const resposta = await makeRequest("http://localhost:8003/login", {
        method: "POST",
        body: JSON.stringify(userObj),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    json = await resposta.json();
    switch (resposta.status) {
        case 201:
            {
                // login ok
                localStorage.setItem("token", json.token);
                localStorage.setItem("login", true);
                localStorage.setItem("activeUser", name);
                document.getElementById("returnMessage").innerHTML = "";

                window.location.href = "index.html"; //redireciona para a página principal
                break;
            }
        case 401:
            {
                // Password errada
                document.getElementById("returnMessage").innerHTML = json.msg;
                break;
            }
        case 404:
            {
                // Utilizador não encontrado
                document.getElementById("returnMessage").innerHTML = json.msg;
                break;
            }
    }

    listar();
}


async function signUp() {
    const email = document.getElementById("email").value;
    const name = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    document.getElementById("returnMessage").innerHTML = "";

    const userObj = {username: name, password: password, email: email, };

    const resposta = await makeRequest("http://localhost:8003/signUp", {
        method: "POST",
        body: JSON.stringify(userObj),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    json = await resposta.json();

    switch (resposta.status) {
        case 409:
            {
                // Utilizador já existe
                document.getElementById("returnMessage").innerHTML = json.msg;
                break;
            }
        case 400:
            {
                // Password Incorreta
                document.getElementById("returnMessage").innerHTML = json.msg;
                break;
            }
        case 201:
            {
                // Utilizador registado
                document.getElementById("returnMessage").innerHTML = json.msg;
                window.location.href = "index.html";
                break;
            }
        case 101:
            {
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


async function listar() {
    const resposta = await makeRequest("http://localhost:8003/listarDados", {
        method: "GET",
        headers: {
            token: localStorage.getItem("token"),
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    dados = await resposta.json();
    switch (resposta.status) {
        case 200:
            {
                // obteve os dados
                let lista = "";
                for (dado of dados) {
                    lista += "ID: " + dado.id + " - Nome: " + dado.nome + "<br>";
                }
                document.getElementById("divListar").innerHTML = lista;
                document.getElementById("pMsg").innerHTML = "";
                break;
            }
        case 401:
            {
                // Utilizador não autenticado ou não autorizado
                document.getElementById("pMsg").innerHTML = dados.msg;
                break;
            }
        case 404:
            {
                // Dados não encontrados
                document.getElementById("pMsg").innerHTML = dados.msg;
                break;
            }
    }
}


async function makeRequest(url, options) {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (err) {
        console.log(err);
    }
}