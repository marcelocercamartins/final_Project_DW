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
    createEventsList(myEventsList);
}


function createEventsList(eventsList){
    const refreshPage = document.getElementById("myEventListContainer");
    refreshPage.innerHTML = "";
    //resultSet é o objeto que vem da base de dados com as informações do evento
    Object.entries(eventsList.resultSet).forEach(([key, value]) => {
            const container = document.querySelector(".myEventListContainer");
            const eventDate = value.date.split("   ");
            let eventDay = "" + eventDate[0];
            const eventHour = "" + eventDate[1];

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
            rightDiv.innerHTML = value.name + "<br>" + eventDay + "<br>" + eventHour + "<br>" + value.location
            
            //ajusta os elementos em página web
            window.addEventListener('resize', function () {
                    if (window.innerWidth < 700) { 
                        rightDiv.innerHTML = value.name + "<br>" + eventDay + "<br>" + eventHour;
                    } else {
                        rightDiv.innerHTML = value.name + "<br>" + eventDay + "<br>" + eventHour + "<br>" + value.location;
                    }
            });


            
            //adição à div principal
            mainDiv.appendChild(rightDiv);

            //Botão para levar á página de mais informações
            const moreInfo = document.createElement("div");
            const deleteEvent = document.createElement("div");
            moreInfo.innerHTML ='<button class="btn btn-primary">Detalhes</button>'
            deleteEvent.innerHTML ='<button class="btn btn-primary">Apagar</button>'
            moreInfo.addEventListener("click", function () {
                    eventDetails(value.name);
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

async function hideMyEventDetails() {
     document.getElementById('overlay').style.display = 'none';
     document.getElementById('popup').style.display = 'none';
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


