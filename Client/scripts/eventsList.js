// função que trata de apresentar os eventos registados   não há necessidade de fazer verificação de tokes    qualquer um pode ver
async function displayEvents() {
        const answer = await makeRequest("http://localhost:8003/registeredEvents", {
                method: "GET",
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });
        const eventsList = await answer.json();
        createEventsList(eventsList);
}

async function eventSearcher(){
        const searchEvent = document.getElementById("searchBox").value;
        const answerSearch = await makeRequest("http://localhost:8003/searchForEvents", {
                method: "POST",
                body: JSON.stringify({searchEvent}),
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });
        const eventsListSearch = await answerSearch.json();
        createEventsList(eventsListSearch);
}

async function myEvents(){
        const answerMyEvents = await makeRequest("http://localhost:8003/myEvents", {
                method: "POST",
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });
        const myEventsList = await answerMyEvents.json();
        createEventsList(myEventsList);
}

function createEventsList(eventsList){
        const refreshPage = document.getElementById("eventListContainer");
        refreshPage.innerHTML = "";
        //resultSet é o objeto que vem da base de dados com as informações do evento
        Object.entries(eventsList.resultSet).forEach(([key, value]) => {
                const container = document.querySelector(".eventListContainer");
                const eventDate = value.date.split("   ");
                let eventDay = "" + eventDate[0];
                const eventHour = "" + eventDate[1];

                //main div contem toda a informação do evento
                const mainDiv = document.createElement("div");
                //configuração da div principal
                mainDiv.className = "mainDiv";
                mainDiv.style.width = "80%";
                mainDiv.style.height = "100px";
                mainDiv.style.marginTop = "20px";
                mainDiv.style.marginBottom = "20px";
                mainDiv.style.marginLeft = "10%";
                mainDiv.style.marginRight = "10%";
                mainDiv.style.display = "flex";
                mainDiv.style.padding = "10px";
                mainDiv.style.border = "1px solid pink";
                mainDiv.style.borderRadius = "10px";

                //left div contem a imagem do evento
                const leftDiv = document.createElement("div");

                //configuração da div 
                leftDiv.className = "leftDiv";
                leftDiv.style.width = "10%";
                leftDiv.style.height = "100%";
                leftDiv.style.paddingLeft = "20px";

                //configuração da imagem
                const eventImage = document.createElement("img");
                //eventImage.alt = value.name;     texto que aparece quando se dá hover à imagem
                eventImage.src = value.imageURL;
                eventImage.style.width = "80px";
                eventImage.style.height = "80px";
                leftDiv.appendChild(eventImage);

                //adição à div principal
                mainDiv.appendChild(leftDiv);

                //right div comtem a informação do evento
                const rightDiv = document.createElement("div");
                //configuração da div
                rightDiv.className = "rightDiv";
                rightDiv.style.width = "82%";
                rightDiv.style.height = "100%";
                rightDiv.style.paddingLeft = "30px";
                rightDiv.style.display = "flex";
                rightDiv.style.alignItems = "center";
                rightDiv.innerHTML = value.name + "<br>" + eventDay + " | | " + eventHour + "<br>" + value.location
                //adição à div principal
                mainDiv.appendChild(rightDiv);

                //Botão para levar á página de mais informações
                const moreInfo = document.createElement("div");
                moreInfo.innerHTML ='<button class="btn btn-primary">Detalhes</button>'
                moreInfo.addEventListener("click", function () {
                        eventDetails(value.name);
                })

                //adição à div principal        
                mainDiv.appendChild(moreInfo);

                //adição do main div ao eventListContainer (div no html que contem a lista de eventos)
                container.appendChild(mainDiv);
        });
}

async function eventDetails(eventName) {
        const eventObj = { event: eventName, }

        const answer = await makeRequest("http://localhost:8003/eventDetails", {
                method: "POST",
                body: JSON.stringify(eventObj),
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });

        const eventInfo = await answer.json();
        const eventDate = eventInfo.resultSet.date.split("   ");
        const eventDay = "" + eventDate[0];
        const eventHour = "" + eventDate[1];
        const eventCoordinates = eventInfo.resultSet.gps.split(", ");
        const eventLatitude = eventCoordinates[0];
        const eventLongitude = eventCoordinates[1];

        //alteração do conteudo do popup conforme o evento. resultSet é o objeto que vem da base de dados com as informações do evento
        document.getElementById('eventTitlePopupDiv').innerText = eventInfo.resultSet.name;
        document.getElementById('eventDatePopupDiv').innerText = eventDay;
        document.getElementById('eventHourPopupDiv').innerText = eventHour;
        document.getElementById('eventDescriptionPopupDiv').innerText = eventInfo.resultSet.description;
        document.getElementById("eventImagePopup").src = eventInfo.resultSet.imageURL;
        callMapsAPI(eventLatitude, eventLongitude)
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('popup').style.display = 'block';
}

async function hideEventDetails() {
       //reset ao mapa
        var container = L.DomUtil.get('eventMapAPIDiv');
        if(container != null){
                container._leaflet_id = null;
        }        
        
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
}

async function callMapsAPI(eventLatitude, eventLongitude) {
        var mymap = L.map('eventMapAPIDiv').setView([eventLatitude, eventLongitude], 15);
        
        //força o carregamento das tiles
        setTimeout(function () {
                window.dispatchEvent(new Event("resize"));
             }, 1);
        
        // Adicione um Tile Layer do OpenStreetMap (necessário - direitos de autor)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mymap);     
                                     
        // Adicione um marcador
        L.marker([eventLatitude, eventLongitude]).addTo(mymap) 
}

async function addToMyEvents() {
        const eventName = document.getElementById("eventTitlePopupDiv").innerText;
        const eventObj = { event: eventName, }

        const answer = await makeRequest("http://localhost:8003/addEventToUser", {
                method: "POST",
                body: JSON.stringify(eventObj),
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },                
        });

        const warning = document.getElementById("warning");
        warning.textContent = "Evento adicionado aos seus favoritos!";
        
        setTimeout(function(){
                warning.textContent = "";
        }, 3000);

        switch (answer.status) {
                case 401:
                        {
                                const warning = document.getElementById("warning");
                                warning.style.color = "red";
                                warning.textContent = "É necessário fazer Login!";
                                
                                setTimeout(function(){
                                        warning.textContent = "";
                                }, 3000);
                                break;
                        }

                case 360:
                        {
                                const warning = document.getElementById("warning");
                                warning.style.color = "red";
                                warning.textContent = "Este evento já se encontra nos seus favoritos!";
                                
                                setTimeout(function(){
                                        warning.textContent = "";
                                }, 3000);
                                break;
                        }
                
                case 201:
                        {
                                const warning = document.getElementById("warning");
                                warning.style.color = "green";
                                warning.textContent = "Este evento foi adicionado aos seus favoritos!";
                                
                                setTimeout(function(){
                                        warning.textContent = "";
                                }, 3000);
                                break;   
                        }
        }
}

function createPosts(){
        document.getElementById('criarEventoLink').addEventListener('click', function() {
                let eventoSquare = document.getElementById('eventoSquare');
                let anotherContainer = document.getElementById('another-container');
                
                
                eventoSquare.style.display = 'block';
                anotherContainer.style.display = 'none';
        // Change 'none' to 'block' to make the square appear

        });}