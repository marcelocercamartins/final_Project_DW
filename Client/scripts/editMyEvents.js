async function myEvents(){
    const userName = localStorage.getItem("activeUser");
    const userObj = {username: userName};
    const answerMyEvents = await makeRequest("http://localhost:8003/myEvents", {
            method: "POST",
            body: JSON.stringify(userObj),
            headers: {
                token: localStorage.getItem("token"),
                "Content-type": "application/json; charset=UTF-8",
            },
    });
    const myEventsList = await answerMyEvents.json();
    createMyEventsList(myEventsList);
}

async function myFavorites(){
    const userName = localStorage.getItem("activeUser");
    const userObj = {username: userName};
    const answerMyEvents = await makeRequest("http://localhost:8003/myFavorites", {
            method: "POST",
            body: JSON.stringify(userObj),
            headers: {
                token: localStorage.getItem("token"),
                "Content-type": "application/json; charset=UTF-8",
            },
    });
    const myEventsList = await answerMyEvents.json();
    createMyEventsFavorite(myEventsList);
    
}

async function myEventSearcher(){
    const searchEvent = document.getElementById("mySearchBox").value;
      
    if (searchEvent.length > 1){
            const answerSearch = await makeRequest("http://localhost:8003/searchForEvents", {
                    method: "POST",
                    body: JSON.stringify({searchEvent}),
                    headers: {
                            token: localStorage.getItem("token"),
                            "Content-type": "application/json; charset=UTF-8",
                    },
            });
            const eventsListSearch = await answerSearch.json();
            const eventsList = prepareList(eventsListSearch.resultSet);        
            createMyEventsList(eventsList);
    } else {
            displayEvents();
    }
}

function createMyEventsList(eventsList){
    const refreshPage = document.getElementById("myEventListContainer");
    const noEventsShow = document.getElementById('myPoststext');
    refreshPage.innerHTML = "";
    //resultSet é o objeto que vem da base de dados com as informações do evento
    if (Object.entries(eventsList.resultSet).length === 0){
        noEventsShow.innerText = "Sem eventos criados";
    }

    Object.entries(eventsList.resultSet).forEach(([key, value]) => {
            const container = document.querySelector(".myEventListContainer");

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
            rightDiv.innerHTML = "<div><strong>" + value.name + " / " + value.ageAdvised + "</strong><br>" + value.date  + "<br>" + value.time + "<br>" + value.location + "</div>"
            
            //ajusta os elementos em página web
            window.addEventListener('resize', function () {
                    if (window.innerWidth < 700) { 
                        rightDiv.innerHTML = value.name + "<br>" + value.date + "<br>" + value.ageAdvised;
                    } else {
                        rightDiv.innerHTML = value.name + "<br>" + value.date  + "<br>" + value.ageAdvised + "<br>" + value.location;
                    }
            });

            
            
            //adição à div principal
            mainDiv.appendChild(rightDiv);

            //Botão para levar á página de mais informações
            const moreInfo = document.createElement("div");
            const deleteEvent = document.createElement("div");
            const editButton = document.getElementById("editButton");
            const saveButton = document.getElementById("saveNewContent");
    
            moreInfo.innerHTML ='<button class="btn btn-primary">Ver/Editar</button>'
            deleteEvent.innerHTML ='<button class="btn btn-primary">Apagar</button>'
            moreInfo.addEventListener("click", function () {
                editButton.style.display = "flex";
                saveButton.style.display = "flex";
                myEventDetails(value.name);
            })

            deleteEvent.addEventListener("click", function(){
                deleteMyEvent(value.name);
            })
            

            //adição à div principal        
            mainDiv.appendChild(moreInfo);
            mainDiv.appendChild(deleteEvent);

            //adição do main div ao eventListContainer (div no html que contem a lista de eventos)
            container.appendChild(mainDiv);
            
    });
}


function createMyEventsFavorite(eventsList){
    const refreshPage = document.getElementById("myFavoriteListContainer");
    const noEventsShow = document.getElementById('myFavoritesText');
    refreshPage.innerHTML = "";
    //resultSet é o objeto que vem da base de dados com as informações do evento
    if (Object.entries(eventsList.resultSet).length === 0){
        noEventsShow.innerText = "Sem Favoritos adicionados";
    }

    Object.entries(eventsList.resultSet).forEach(([key, value]) => {
            const container = document.querySelector(".myFavoriteListContainer");

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
            rightDiv.innerHTML = "<div><strong>" + value.name + " / " + value.ageAdvised + "</strong><br>" + value.date  + "<br>" + value.time + "<br>" + value.location + "</div>"
            
            //ajusta os elementos em página web
            window.addEventListener('resize', function () {
                    if (window.innerWidth < 700) { 
                        rightDiv.innerHTML = value.name + "<br>" + value.date + "<br>" + value.ageAdvised;
                    } else {
                        rightDiv.innerHTML = value.name + "<br>" + value.date  + "<br>" + value.ageAdvised + "<br>" + value.location;
                    }
            });

            
            
            //adição à div principal
            mainDiv.appendChild(rightDiv);

            //Botão para levar á página de mais informações
            const moreInfo = document.createElement("div");
            const editButton = document.getElementById("editButton");
            const saveButton = document.getElementById("saveNewContent");
            editButton.style.display = "none";
            saveButton.style.display = "none";
            moreInfo.innerHTML ='<button class="btn btn-primary">Detalhes</button>'
            moreInfo.addEventListener("click", function () {
                    myEventDetails(value.name);
            })
            

            //adição à div principal        
            mainDiv.appendChild(moreInfo);

            //adição do main div ao eventListContainer (div no html que contem a lista de eventos)
            container.appendChild(mainDiv);
            
    });
}

async function myEventDetails(eventName) {
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
    const eventCoordinates = eventInfo.resultSet.gps.split(", ");
    const eventLatitude = eventCoordinates[0];
    const eventLongitude = eventCoordinates[1];

    //alteração do conteudo do popup conforme o evento. resultSet é o objeto que vem da base de dados com as informações do evento
    Object.entries(eventInfo).forEach(([key, value]) => {
        // rightDiv.innerHTML = value.name + "<br>" + value.date  + "<br>" + value.time + "<br>" + value.location;
    localStorage.setItem("eventId", value._id);
    eventTitlePopupDiv = document.getElementById('eventTitlePopupDiv');
    const ageAdvised = document.getElementById("ageAdvised");
    eventTitlePopupDiv.innerText = value.name;
    eventTitlePopupDiv.style.fontWeight = "bold";
    eventTitlePopupDiv.style.color = "hotpink";
    ageAdvised.style.fontWeight = "bold";
    document.getElementById('eventDatePopupDiv').innerText = value.date;
    document.getElementById('eventHourPopupDiv').innerText = value.time;
    document.getElementById('eventDescriptionPopupDiv').innerText = value.description;
    document.getElementById("eventImagePopup").src = value.imageURL;
    document.getElementById("eventLocation").innerText = value.location;
    ageAdvised.innerText = value.ageAdvised;
    const newImageInput = document.getElementById("newImageInput");
    const gpsNewInput = document.getElementById("gpsNewInput");
    newImageInput.value = value.imageURL;
    gpsNewInput.value = eventLatitude.toString() + ', ' + eventLongitude.toString();

    callMapsAPI(eventLatitude, eventLongitude)
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
})
}


async function deleteMyEvent(eventName) {
    const eventObj = {name: eventName}
        const answer = await makeRequest("http://localhost:8003/deleteEvent", {
                method: "DELETE",
                body: JSON.stringify(eventObj),
                headers: {
                        token: localStorage.getItem("token"),
                        "Content-type": "application/json; charset=UTF-8",
                },
        });
    await answer.json();
    myEvents()

  
  }

    async function saveNewContent() {
        const newImageInput = document.getElementById("newImageInput");
        const gpsNewInput = document.getElementById("gpsNewInput");
        newImageInput.style.display = "none";
        gpsNewInput.style.display = "none";
        const eventImage = newImageInput.value;
        const information = document.getElementById("eventfTitlePopupDiv").innerHTML;
        const eventDate = document.getElementById("eventDatePopupDiv").innerHTML;
        const eventHour = document.getElementById("eventHourPopupDiv").innerHTML;
        const eventDescription = document.getElementById("eventDescriptionPopupDiv").innerHTML;
        const eventLocation = document.getElementById("eventLocation").innerHTML;
        const ageAdvised = document.getElementById("ageAdvised").innerHTML;
        const gpsNew = gpsNewInput.value;
        // const eventMap = document.getElementById("eventMapAPIDiv").value; 
        const eventId = localStorage.getItem("eventId");
        localStorage.setItem("name", information);
        

        const userObj = {name: information, ageAdvised: ageAdvised, _id: eventId, date: eventDate, time: eventHour, location: eventLocation, description: eventDescription, imageURL: eventImage, gps: gpsNew};
        
        const answer = await makeRequest("http://localhost:8003/postInfoUpdate", {
            method: "POST",
            body: JSON.stringify(userObj),
            headers: { 
                token: localStorage.getItem("token"),
                "Content-type": "application/json; charset=UTF-8" },
    });

        await answer.json();

  }  
