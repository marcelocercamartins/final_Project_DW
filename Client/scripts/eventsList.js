// função que trata de apresentar os eventos registados não há necessidade de fazer verificação de tokens qualquer um pode ver
async function displayEvents() {
        const answer = await makeRequest("http://localhost:8003/registeredEvents", {
                method: "GET",
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });
        const eventsList = await answer.json();
        switch (answer.status) {
                case 200:
                {
                        createEventsList(eventsList.resultSet);
                        break;
                }
                default:
                {
                        // Erro detetado
                        alert(json.msg);
                        break;
                }
        }
}


async function eventSearcher(){
        const searchEvent = document.getElementById("searchBox").value;
          
        if (searchEvent.length > 1){
                const answer = await makeRequest("http://localhost:8003/searchForEvents", {
                        method: "POST",
                        body: JSON.stringify({searchEvent}),
                        headers: {
                                token: localStorage.getItem("token"),
                                "Content-type": "application/json; charset=UTF-8",
                        },
                });
                const eventsListSearch = await answer.json();
                switch (answer.status) {
                        case 200:
                        {
                                const eventsList = prepareList(eventsListSearch.resultSet);        
                                createEventsList(eventsList.resultSet);
                                break;
                        }
                        default:
                        {
                                // Erro detetado
                                alert(json.msg);
                                break;
                        }
                }    
        } else {
                displayEvents();
        }
}

function prepareList(eventsListSearch) {
        const preparedList = { resultSet: [] };
    
        for (let i = 0; i < eventsListSearch.length; i++) {
            if (Array.isArray(eventsListSearch[i]) && eventsListSearch[i].length > 0) {
                preparedList.resultSet.push(...eventsListSearch[i]);
            }
        }
    
        console.log(preparedList);
        return preparedList;
    }


function createEventsList(eventsList){
        const refreshPage = document.getElementById("eventListContainer");
        refreshPage.innerHTML = "";
        //resultSet é o objeto que vem da base de dados com as informações do evento
        Object.entries(eventsList).forEach(([key, value]) => {
                const container = document.querySelector(".eventListContainer");

                //main div contem toda a informação do evento
                const mainDiv = document.createElement("div");
                //configuração da div principal
                mainDiv.className = "mainDiv";
                mainDiv.style.width = "80%";
                mainDiv.style.height = "120px";
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
                leftDiv.style.flex = "0 0 10%";
                leftDiv.style.height = "100%";
                leftDiv.style.paddingLeft = "20px";
                leftDiv.style.paddingTop = "5px";

                //configuração da imagem
                const eventImage = document.createElement("img");
                //eventImage.alt = value.name;     texto que aparece quando se dá hover à imagem
                eventImage.src = value.imageURL;
                eventImage.style.width = "90px";
                eventImage.style.height = "90px";
                leftDiv.appendChild(eventImage);

                //adição à div principal
                mainDiv.appendChild(leftDiv);

                //right div comtem a informação do evento
                const rightDiv = document.createElement("div");
                //configuração da div
                rightDiv.className = "rightDiv";
                rightDiv.style.flex = "1";
                rightDiv.style.height = "100%";
                rightDiv.style.paddingLeft = "30px";
                rightDiv.style.display = "flex";
                rightDiv.style.alignItems = "center";
                rightDiv.style.overflow = "hidden";  
                rightDiv.innerHTML = value.name + "<br>" + value.date + "<br>" + value.time + "<br>" + value.location
                
                //ajusta os elementos em página web
                window.addEventListener('resize', function () {
                        if (window.innerWidth < 700) { 
                            rightDiv.innerHTML = value.name + "<br>" + value.date + "<br>" + value.time;
                        } else {
                            rightDiv.innerHTML = value.name + "<br>" + value.date + "<br>" + value.time + "<br>" + value.location;
                        }
                });


                
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
        const eventObj = {name: eventName}

        const answer = await makeRequest("http://localhost:8003/eventDetails", {
                method: "POST",
                body: JSON.stringify(eventObj),
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });
        const eventInfo = await answer.json();
        switch (answer.status) {
                case 200:
                {
                        const eventCoordinates = eventInfo.resultSet.gps.split(", ");
                        const eventLatitude = eventCoordinates[0];
                        const eventLongitude = eventCoordinates[1];
                
                        //alteração do conteudo do popup conforme o evento. resultSet é o objeto que vem da base de dados com as informações do evento
                        document.getElementById('eventTitlePopupDiv').innerText = eventInfo.resultSet.name;
                        document.getElementById('eventDatePopupDiv').innerText = eventInfo.resultSet.date;
                        document.getElementById('eventHourPopupDiv').innerText = eventInfo.resultSet.time;
                        document.getElementById('eventDescriptionPopupDiv').innerText = eventInfo.resultSet.description;
                        document.getElementById("eventImagePopup").src = eventInfo.resultSet.imageURL;
                        
                        const needForMap = verifyCoordinates(eventCoordinates);
                
                        if (needForMap == 1){
                                callMapsAPI(eventLatitude, eventLongitude);
                        }
                        
                        const userLogged = await verifyIfThereIsAUserLoggedIn();
                
                        if (userLogged == 1){
                                document.getElementById("addToMyEventsButton").style.display = "block";
                        } else {
                                document.getElementById("addToMyEventsButton").style.display = "none";
                        }
                
                        document.getElementById('overlay').style.display = 'block';
                        document.getElementById('popup').style.display = 'block';
                        break;
                }
                default:
                {
                        // Erro detetado
                        alert(json.msg);
                        break;
                }
        }    
}

function verifyCoordinates(eventCoordinates){
        console.log(eventCoordinates);
        if (eventCoordinates == ""){
                return 0;
        }

        return 1;
}

async function verifyIfThereIsAUserLoggedIn(){
        const answer = await makeRequest("http://localhost:8003/verifyIfUserIsLoggendIn", {
                method: "GET",
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },                
        });

        if (answer.status == 401){
                return 0;
        } else {
                return 1;
        }
}

var map = null;

function hideEventDetails() {
       //reset ao mapa
       try{
        map.remove(); 
       } catch(error){
        console.log(error);
       }         
        
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
}

function callMapsAPI(eventLatitude, eventLongitude) {
        map = L.map('eventMapAPIDiv', {
                center: [eventLatitude, eventLongitude],
                zoom: 15,
                dragging: true,  
                zoomControl: true,  
                scrollWheelZoom: true,
                doubleClickZoom: true  
            });

        //força o carregamento das tiles
        setTimeout(function () {
                window.dispatchEvent(new Event("resize"));
             }, 100);
        
        // Adicione um Tile Layer do OpenStreetMap (necessário - direitos de autor)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);     
                                     
        // Adicione um marcador
        L.marker([eventLatitude, eventLongitude]).addTo(map) 
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
                                logoutByExpiredToken();
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
        let eventoSquare = document.getElementById('eventoSquare');
        let anotherContainer = document.getElementById('another-container');
        let myEventListContainer = document.getElementById('myEventListContainer');
        let searchContainerMyEvents = document.getElementById('mySearchBox');
        let noEventstoShow = document.getElementById('noEventstoShow');
        myEventListContainer.style.display = 'none';
        eventoSquare.style.display = 'block';
        anotherContainer.style.display = 'none';
        searchContainerMyEvents.style.display = 'none';
        noEventstoShow.textContent = " ";
        // Change 'none' to 'block' to make the square appear
}

function managePosts(){
        let eventoSquare = document.getElementById('eventoSquare');
        let anotherContainer = document.getElementById('another-container');
        let myEventListContainer = document.getElementById('myEventListContainer');
        let searchContainerMyEvents = document.getElementById('mySearchBox');
        let backButton = document.getElementById('backButton');
        eventoSquare.style.display = 'none';
        anotherContainer.style.display = 'none';
        myEventListContainer.style.display = 'block';
        searchContainerMyEvents.style.display = 'block';
        backButton.style.display = 'flex';
}

async function addEvent() {
        window.location.href = "myEvents.html";
        const title = document.getElementById("titleInput").value;
        const date = document.getElementById("dateInput").value;
        const time = document.getElementById("hourInput").value;
        const location = document.getElementById("locationInput").value;
        const gps = document.getElementById("gpsInput").value;
        const description = document.getElementById("descriptionInput").value;
        const image = document.getElementById("imageInput").value;
        const username = localStorage.getItem("activeUser"); 
        const postObj = {name: title, date: date, time:time, location: location, gps: gps, description: description, imageURL: image, username: username};
       
        const answer = await makeRequest("http://localhost:8003/addEvent", {
            method: "POST",
            body: JSON.stringify(postObj),
            headers: {
                token: localStorage.getItem("token"),
                "Content-type": "application/json; charset=UTF-8" },
        });
        const result = await answer.json();
        switch (answer.status) {
                case 201:
                {  
                        break;
                }
                case 401:
                {
                        logoutByExpiredToken();
                        break;
                }
                default:
                {
                        // Erro detetado
                        alert(json.msg);
                        break;
                }
        }    
    
}
    
async function myPosts() {
        const userName = localStorage.getItem("activeUser");
        const userObj = {username: userName};
        const answer = await makeRequest("http://localhost:8003/myEvents", {
          method: "POST",
          body: JSON.stringify(userObj),
          headers: {
            token: localStorage.getItem("token"),
            "Content-type": "application/json; charset=UTF-8",
          },
        });
        const myEventsList = await answer.json();
        switch (answer.status) {
                case 200:
                {  
                        createList(myEventsList.resultSet);
                        break;
                }
                case 401:
                {
                        logoutByExpiredToken();
                        break;
                }
                default:
                {
                        // Erro detetado
                        alert(json.msg);
                        break;
                }
        }    
}

function createList(events) {
        if (events.length === 0){
                let noEvents = document.getElementById("eventShow");
                noEvents.textContent = " ";
        }
        const eventsContainer = document.getElementById("events-container");
      
        events.slice(-3,events.length).forEach((event) => {
          const eventElement = document.createElement("div");
          eventElement.className = "col-6 col-md-6 col-lg-4";
          eventElement.dataset.aos = "fade-up";
          eventElement.dataset.aosDelay = "100";
      
          const linkElement = document.createElement("a");
          linkElement.href = event.imageURL; 
          linkElement.className = "d-block photo-item";
          linkElement.dataset.fancybox = "gallery";
      
          const imgElement = document.createElement("img");
          imgElement.src = event.imageURL; 
          imgElement.alt = "Image";
          imgElement.className = "img-fluid mb-0";
      
          linkElement.appendChild(imgElement);
      
          const headingElement = document.createElement("h6");
          headingElement.className = "heading";
          headingElement.textContent = event.name;
        
      
          eventElement.appendChild(linkElement);
          eventElement.appendChild(headingElement);
      
          eventsContainer.appendChild(eventElement);
        });
}