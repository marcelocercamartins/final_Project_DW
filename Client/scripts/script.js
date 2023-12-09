async function login() {
    const name = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const user = {
        username: name,
        password: password,
    };
    const resposta = await makeRequest("http://localhost:8002/login", {
        method: "POST",
        body: JSON.stringify(user),
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

                window.location.href = "index.html";
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
}

function getTocken()
{
    alert(localStorage.getItem('token'));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("login");
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";

}

function registar() {
    document.getElementById("divLogin").style.display = "block";
    document.getElementById("legenda").innerText = "Registar";
    document.getElementById("btnLogin").style.display = "none";
    document.getElementById("btnRegistar").style.display = "inline";
}

function logar() {
    document.getElementById('divLogin').style.display='block';
    document.getElementById("legenda").innerText = "Login";
    document.getElementById("btnLogin").style.display = "inline";
    document.getElementById("btnRegistar").style.display = "none";
}

async function registarEnviar() {
    const nome = document.getElementById("username").value;
    const senha = document.getElementById("password").value;
    const user = {
        username: nome,
        password: senha,
    };
    const resposta = await makeRequest("http://localhost:8002/register", {
        method: "POST",
        body: JSON.stringify(user),
        headers: { "Content-type": "application/json; charset=UTF-8" },
    });
    json = await resposta.json();
    switch (resposta.status) {
        case 409:
            {
                // Utilizador já existe
                document.getElementById("pMsg").innerHTML = json.msg;
                break;
            }
        case 400:
            {
                // Password inaceitável
                document.getElementById("pMsg").innerHTML = json.msg;
                break;
            }
        case 201:
            {
                // Utilizador registado
                document.getElementById("pMsg").innerHTML = json.msg;
                break;
            }
    }
}

async function listar() {
    const resposta = await makeRequest("http://localhost:8002/listarDados", {
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

async function processResponseStatusCode(response)
{

}

async function makeRequest(url, options) {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (err) {
        console.log(err);
    }
}