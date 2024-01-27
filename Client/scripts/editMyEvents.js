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
            console.log(eventsListSearch);
            const eventsList = prepareList(eventsListSearch.resultSet);        
            createMyEventsList(eventsList);
    } else {
            displayEvents();
    }
}

function createMyEventsList(eventsList){
    const refreshPage = document.getElementById("myEventListContainer");
    let noEventsShow = document.getElementById('noEventstoShow');
    refreshPage.innerHTML = "";
    //resultSet é o objeto que vem da base de dados com as informações do evento
    if (Object.entries(eventsList.resultSet).length === 0){
        noEventsShow.innerText = "Sem eventos";
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
            rightDiv.innerHTML = value.name + "<br>" + value.date  + "<br>" + value.time + "<br>" + value.location
            
            //ajusta os elementos em página web
            window.addEventListener('resize', function () {
                    if (window.innerWidth < 700) { 
                        rightDiv.innerHTML = value.name + "<br>" + value.date + "<br>" + value.time;
                    } else {
                        rightDiv.innerHTML = value.name + "<br>" + value.date  + "<br>" + value.time + "<br>" + value.location;
                    }
            });

            
            
            //adição à div principal
            mainDiv.appendChild(rightDiv);

            //Botão para levar á página de mais informações
            const moreInfo = document.createElement("div");
            const deleteEvent = document.createElement("div");
            moreInfo.innerHTML ='<button class="btn btn-primary">Editar</button>'
            deleteEvent.innerHTML ='<button class="btn btn-primary">Apagar</button>'
            moreInfo.addEventListener("click", function () {
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
    document.getElementById('eventTitlePopupDiv').innerText = value.name;
    document.getElementById('eventDatePopupDiv').innerText = value.date;
    document.getElementById('eventHourPopupDiv').innerText = value.time;
    document.getElementById('eventDescriptionPopupDiv').innerText = value.description;
    document.getElementById("eventImagePopup").src = value.imageURL;
    callMapsAPI(eventLatitude, eventLongitude)
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
})
}


async function deleteMyEvent(eventName) {
    const eventObj = {name: eventName}
    console.log(eventName)
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
    const information = document.getElementById("eventTitlePopupDiv").innerHTML;
    const eventId = localStorage.getItem("eventId");
    localStorage.setItem("name", information);

    const userObj = {name: information, _id: eventId};
    console.log("estamos aqui", userObj)
    
    const answer = await makeRequest("http://localhost:8003/postInfoUpdate", {
        method: "POST",
        body: JSON.stringify(userObj),
        headers: { 
            token: localStorage.getItem("token"),
            "Content-type": "application/json; charset=UTF-8" },
});

    await answer.json();

  }  


