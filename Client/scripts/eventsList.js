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
        const moreInfo = document.createElement("button");
                //configuração do botão
        moreInfo.id = "Detalhes";
        moreInfo.textContent = "Detalhes";
        moreInfo.style.height = "45%";
        moreInfo.style.width = "10%";
        moreInfo.style.paddingBottom = "5px";
        moreInfo.style.borderRadius = "10px";
        moreInfo.style.alignContent = "center";
        moreInfo.style.alignSelf = "center";
        moreInfo.addEventListener("click", function(){
                eventDetails(value.name);
        })
   
                //adição à div principal        
        mainDiv.appendChild(moreInfo);

        //adição do main div ao eventListContainer (div no html que contem a lista de eventos)
        container.appendChild(mainDiv);
    });
}

async function eventDetails(eventName){
        const container = document.querySelector(".overlay")
        const eventObj = {event : eventName, }

        const answer = await makeRequest("http://localhost:8003/eventDetails", {
                method: "POST",
                body: JSON.stringify(eventObj),
                headers: {
                    token: localStorage.getItem("token"),
                    "Content-type": "application/json; charset=UTF-8",
                },
            });


        //removePopup();
        const eventInfo = await answer.json();

        //resultSet é o objeto que vem da base de dados com as informações do evento
        //div principal que involve as divs com os detalhes do evento     
        const popup = document.createElement("div");
        popup.className = "popup";


        const closeButton = document.createElement("span");
        closeButton.className = "closeButton";
        closeButton.innerText = "X";
        closeButton.addEventListener("click", hideEventDetails());
        popup.appendChild(closeButton);

        //div com o nome do evento
        const eventTitle = document.createElement("div");
        eventTitle.className = "eventTitle";
        eventTitle.innerText = eventInfo.resultSet.name;
        popup.appendChild(eventTitle);


        //adição do popup à div overlay no html
        container.appendChild(popup);

        //mostrar as divs apos pressionar o botão e carregar a informação do evento
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('popup').style.display = 'block';
}

async function hideEventDetails(){
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
}

async function removePopup(){
        const existingOverlay = document.querySelector('.overlay');
        const existingPopup = document.querySelector('.popup');
      
        if (existingOverlay) {
          existingOverlay.parentNode.removeChild(existingOverlay);
        }
      
        if (existingPopup) {
          existingPopup.parentNode.removeChild(existingPopup);
        }        
}