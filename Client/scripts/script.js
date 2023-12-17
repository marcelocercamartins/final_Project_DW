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
    const answer = await makeRequest("http://localhost:8003/listarDados", {
        method: "GET",
        headers: {
            token: localStorage.getItem("token"),
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    dados = await answer.json();
    switch (answer.status) {
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

// função que trata de apresentar os eventos registados   não há necessidade de fazer verificação de tokes    qualquer um pode ver
async function displayEvents(){
    const answer = await makeRequest("http://localhost:8003/registeredEvents", {
        method: "GET",
        headers: {
            token: localStorage.getItem("token"),
            "Content-type": "application/json; charset=UTF-8",
        },
    });
  
    const eventsList = await answer.json();

    Object.entries(eventsList.eventsList).forEach(([key, value]) => {
        const container = document.querySelector(".eventListContainer")
        const eventDate = value.date.split("   ");
        let eventDay = "" + eventDate[0];
        const eventHour = "" + eventDate[1];

        //main div contem toda a informação do evento
        const mainDiv = document.createElement("div");
        mainDiv.className = "maiDiv";
        mainDiv.style.width = "80%";
        mainDiv.style.height = "100px";
        mainDiv.style.marginTop = "20px";
        mainDiv.style.marginBottom = "20px";
        mainDiv.style.marginLeft = "10%";
        mainDiv.style.marginRight = "10%";
        mainDiv.style.display = "flex";
        mainDiv.style.padding = "10px";
        mainDiv.style.border = "1px solid orange";
        mainDiv.style.borderRadius = "10px";

        //left div contem a imagem do evento
        const leftDiv = document.createElement("div");
        leftDiv.className = "leftDiv";
        leftDiv.style.width = "10%";
        leftDiv.style.height = "100%";
        leftDiv.style.backgroundColor = "red";
        mainDiv.appendChild(leftDiv);

        //right div comtem a informação do evento
        const rightDiv = document.createElement("div");
        rightDiv.className = "rightDiv";
        rightDiv.style.width = "100%";
        rightDiv.style.height = "100%";
        rightDiv.style.backgroundColor = "blue";
        mainDiv.appendChild(rightDiv);

        //Botão para levar á página de mais informações
        const moreInfo = document.createElement("button");
        moreInfo.textContent = "+";
        moreInfo.style.height = "45%";
        moreInfo.style.width = "5%";
        moreInfo.style.borderRadius = "10px";
        moreInfo.style.alignContent = "center";
        moreInfo.style.alignSelf = "center";
        mainDiv.appendChild(moreInfo);

        //adição do main div ao eventListContainer (div no html que contem a lista de eventos)
        container.appendChild(mainDiv);
    });
}