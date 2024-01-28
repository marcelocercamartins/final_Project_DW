require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const { decode } = require('punycode');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT;
const secret = process.env.SECRET;

const uri = process.env.DBURI;
const database = process.env.DATABASE;
const emailFrom = process.env.EMAILFROM;
const passwordEmail = process.env.EMAILPASSWORD;

app.use(cors());
app.options('*', cors())
app.use(express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/////////////////API Endpoints////////////////////////
// Criar novo utilizador
app.post("/signUp", async (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const findUserName = await findOneResult("users", { username: username });

    if (findUserName == null) {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = { username: username, email: email, password: hashedPassword, events: [] };
           
            await insertLinesOnDatabase("users", newUser);

            sendEmail(email);
            return res.status(201).send({ msg:""});
        } catch (error) {
            console.error("Erro ao criar o utilizador: " + error);
            return res.status(500).send({ msg:'Erro interno de servidor'});
        }
    } else {
        console.log("Utilizador já existe");
        return res.status(409).send({ msg: 'Utilizador já existe' });
    }
});


// Login
app.post("/login", async (req, res) => {
    const name = req.body.username;
    const password = req.body.password;

    const findUser = await findOneResult("users", { username: name });

    if (findUser != null) 
    {     
        bcrypt.compare(password, findUser.password, (error, isMatch) => {
            if (error) {             
                console.error("Erro ao comparar a password: ", error);
                return res.status(500).send({ msg:'Erro interno de servidor'});
            }

            if (isMatch) {           
                const user = { username: name, password: findUser.password };
                const token = jwt.sign(user, secret, {expiresIn: "900s"});
                return res.status(200).json({ auth: true, token: token, msg: "" });
            } else { 
                return res.status(401).json({ msg: "Password inválida!" });
            }
        });
    } else {
        console.log("Utilizador não encontrado!");
        return res.status(404).json({ msg: "Utilizador não encontrado!" });
    }
});


app.post("/addEventToUser", async (req, res) => {
    try{
        //verificar se existe um utilizador logado
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        } 
        
        //Adição do evento ao utilizador
        const userName = userToken.username;
        const eventName = req.body.event;
    
        //Para atualizar apenas o array de eventos tenho de tirar o array atual adicionar o evento novo e dps atualizar o campo
        // preciso do id do objeto tb acho
        const userInfo = await findOneResult("users", { username: userName });
        const userID = userInfo._id;
        const userEventsList = userInfo.events;
    
        const verifyIfAlreadyAdded = verifyIfEventAlreadyOnList(userInfo, eventName);
        
        if (verifyIfAlreadyAdded == 0) {
            const updatedList = userEventsList.concat(eventName);
            updateObjectField("users", userID, updatedList);
            return res.status(201).json({ msg: "" });
            } else {
            return res.status(360).json({ msg: "" });
        }    
    }catch(error){
        console.log("Error interno no servidor no endpoint addEventToUser " + error);
        return res.status(500).send({ msg:'Erro interno de servidor'});
    }
})


// registeredEvents não existe necessidade de verificar token os eventos registados qualquer um pode ver
app.get("/registeredEvents", async (req, res) => {
    try{
         const eventsList = await findAll("events", {});
        return res.status(200).json({ resultSet: eventsList });
    }catch(error){
        console.log("Error interno no servidor no endpoint registeredEvents " + error);
        return res.status(500).send({ msg:'Erro interno de servidor'});
    } 
});


// endpoint utilizado para fazer uma pesquisa de eventos especifica
app.post("/searchForEvents", async (req, res) => {
    try{
        const searchRaw = req.body;
        const eventsList = [];
    
        const search = searchRaw.searchEvent;
        
        eventsList.push(await findAll("events", {name: new RegExp(search, 'i')}))
        eventsList.push(await findAll("events", {date: new RegExp(search, 'i')}))
        eventsList.push(await findAll("events", {time: new RegExp(search, 'i')}))
        eventsList.push(await findAll("events", {location: new RegExp(search, 'i')}))

        return res.status(200).json({ resultSet: eventsList });
    }catch(error){
        console.log("Error interno no servidor no endpoint searchForEvents " + error);
        return res.status(500).send({ msg:'Erro interno de servidor'});
    }
});


//endpoint para utilizado para obter os detalhes de determinado evento
app.post("/eventDetails", async (req, res) => {
    try{
        const eventName = req.body.name;
        const filter = { name: eventName};

        const eventInfo = await findOneResult("events", filter);
        return res.status(200).json({ resultSet: eventInfo });
    }catch(error){
        console.log("Error interno no servidor no endpoint eventDetails " + error);
        return res.status(500).send({ msg:'Erro interno de servidor'});
    }
});


//endpoint utilizado para remoção de eventos
app.delete("/deleteEvent", async (req, res) => {
    try{
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        } 
            
        const eventName = req.body.name; 
        // Nome do evento deve vir no body, caso não venha é somente necessário introduzir variável de entrada
    
        try {
            const result = await deleteEvent(eventName);
            if (result.deletedCount === 0) {
                res.status(404).json({ msg: "Evento não foi encontrado ou já foi anteriormente apagado" });
            } else {
                res.status(200).json({ msg: "Evento apagado com sucesso" });
            }
        } catch (err) {
            res.status(500).json({ msg: "Falha ao remover o evento" });
        }
    }catch(error){
        console.log("Error interno no servidor no endpoint deleteEvent " + error);
        return res.status(500).send({ msg:'Erro interno de servidor'});
    }
});


//endpoint para criar evento
app.post("/addEvent", async (req, res) => {
    try {
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        } 
        
        console.log("Received Data:", req.body);
        const title = req.body.name;
        const date = req.body.date;
        const time = req.body.time;
        const location = req.body.location;
        const gps = req.body.gps;
        const description = req.body.description;
        const image= req.body.imageURL;
        const username = req.body.username;

        const insertValue = {name: title, date: date, time:time, location: location, gps: gps, description: description, imageURL: image, username: username};
        await insertLinesOnDatabase("events", insertValue);
        //meter logo o evento criado na lista de favoritos do utilizador//
        const userInfo = await findOneResult("users", { username: username });
        const userID = userInfo._id;
        const userEventsList = userInfo.events;
        const updatedList = userEventsList.concat(title);
        await updateObjectField("users", userID, updatedList);
        //-------------------------------------------------------------//
        res.status(201).json({ msg: "Evento adicionado com sucesso" });
    } catch (err) {
        console.log("Error interno no servidor no endpoint addEvent " + err);
        res.status(500).json({ msg: "Falha ao adicionar o evento" });
    }
});

app.post("/userInfoUpdate", async (req,res) => {
    try{
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        }
    
        const information = req.body.information;
        const username = req.body.username;
        const filter = { username: username};
        const include = { information: information };
    
        await updateUserInfo("users", filter, include);
        res.status(200).json({ msg: "Informação adicionada com sucesso" });
    }catch(error){
        console.log("Error interno no servidor no endpoint userInfoUpdate " + error);
        res.status(500).json({ msg: "Falha ao atualizar"});
    }
});

app.post("/postInfoUpdate", async (req,res) => {
    try{
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        }
        const information = req.body.name;
        const eventId = req.body._id;
        const eventDate = req.body.date;
        const eventHour = req.body.time;
        const eventDescription = req.body.description;
        const eventImage = req.body.imageURL;
        const eventLocation = req.body.location
        const eventMap = req.body.gps;
        const include = { name: information, date: eventDate, time: eventHour, location: eventLocation, description: eventDescription, imageURL: eventImage};
    
        await updatePost("events", eventId, include);
        res.status(200).json({ msg: "Informação adicionada com sucesso" });
    }catch(error){
        console.log("Error interno no servidor no endpoint postInfoUpdate " + error);
        res.status(500).json({ msg: "Falha ao atualizar" });
    }
});
    

//endpoint utilizado para receber os eventos de um utilizador
app.post("/myEvents", async (req, res) => {
    try{
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        } 
    
        const username = req.body.username;
        const filter = { username: username};
        
        const eventsList = await findAll("events", filter);

        return res.status(200).json({ resultSet: eventsList });
    }catch(error){
        console.log("Error interno no servidor no endpoint myEvents " + error);
        res.status(500).json({ msg: "Falha ao adicionar o evento" });
    }  
});


app.post("/myFavorites", async (req, res) => {
    try{
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        } 
    
        const username = req.body.username;
        const filter = { username: username};
        
        let finalFavorites = [];
        const eventsList = await findAll("users", filter);
        const favoritesList = eventsList[0].events;
        if (favoritesList.length > 0){
            for (i = 0; i < favoritesList.length; i++){
                finalFavorites.push(await findOneResult("events", {name : favoritesList[i]}));
            }
        }
        return res.status(200).json({ resultSet: finalFavorites });
    }catch(error){
        console.log("Error interno no servidor no endpoint myFavorites " + error);
        res.status(500).json({ msg: "Erro interno de servidor" });
    }  
});

app.get("/verifyIfUserIsLoggendIn", async(req, res) => {
    try{
        const userToken = verifyToken(req.header('token'));
        if (!userToken){
            return res.status(401).json({msg:"Utilizador não autenticado"});
        }
         
        return res.status(200).json({});
    }catch(error){
        console.log("Error interno no servidor no endpoint verifyIfUserIsLoggendIn " + error);
        res.status(500).json({ msg: "Erro interno de servidor" });
    }
})


function verifyIfEventAlreadyOnList(userInfo, event) {
    const userEvents = userInfo.events;

    for (var i = 0; i < userEvents.length; i++) {
        if (userEvents[i] == event) {
            return 1;
        }
    }
    return 0;
}


/////////////////funções Base de dados////////////////////////

//Para introduzirem eventos na base de dados usem esta função com o as seguintes entradas
//insertLinesOnDatabase("events",{name:'teste',date:'16-06-2023   16h30m',location:'teste',gps:'38.7673, -9.09381',descripton:'“Imaginem...',aderentes:[],
//imageURL:'https://www.fproducao.pt/public/uploads/espectaculos/novo_site/fotos_de_capa/Uma%20Nespera%20no%20Cu%20-%20O%20Musical/Nespera_Musical_Site_Poster_Final.jpg'})

async function insertLinesOnDatabase(table, valuetToInsert) {
    const dbConn = new MongoClient(uri);

    try {
        const insert_db = await dbConn.db(database);
        insert_db.collection(table).insertOne(valuetToInsert, function (err, res) {
            if (err) {
                res.send(JSON.stringify(err));
            } else {
                
                res.send("inserted!");
            }
        });
    } catch (err) {
        console.log(err);
    } finally {
        await dbConn.close();
    }
}
//REDUNDANCIA A TRABALHAR, mas por agora funca
async function updateObjectField(table, id, value) {
    const dbConn = new MongoClient(uri);
    try {
        const insert_db = await dbConn.db(database);
        insert_db.collection(table).updateOne({ _id: id }, { $set: { "events": value } })
    } catch (err) {
        console.log(err)
    } finally {
        await dbConn.close();
    }
}


async function updateUserInfo(table, filter,  value) {
    const dbConn = new MongoClient(uri);
    try {
        const insert_db = await dbConn.db(database);
        insert_db.collection(table).updateOne(filter, {$set: value })
    } catch (err) {
        console.log(err)
    } finally {
        await dbConn.close();
    }
} 

async function updatePost(table, filter,  value) {
    console.log(table, filter,  value)
    const dbConn = new MongoClient(uri);
    try {
        const insert_db = await dbConn.db(database);
        insert_db.collection(table).updateOne({ _id: new ObjectId(filter)}, {$set: value});
        console.log("Adicionado com sucesso");
    } catch (err) {
        console.log(err)
    } finally {
        await dbConn.close();
    }
} 



async function findOneResult(table, findWhat) {
    const dbConn = new MongoClient(uri);
    try {
        const findResult = await dbConn.db(database).collection(table).findOne(findWhat);
        console.log("findOneResult: " + findResult);
        await dbConn.close();
        return findResult;
    } catch (err) {
        console.log(err);
    } finally {
        await dbConn.close();
    }
}

//Função para obter os objetos todos de uma tabela
async function findAll(table, filter) {
    const dbConn = new MongoClient(uri);

    try {
        const findResult = await dbConn.db(database).collection(table).find(filter).toArray();
        await dbConn.close();
        return findResult;
    } catch (err) {
        console.log(err);
    } finally {
        await dbConn.close();
    }
}

//Função de delete
async function deleteEvent(eventName) {
    const dbConn = new MongoClient(uri);

    try {
        await dbConn.connect();

        // Delete the event from the events collection
        const deleteResult = await dbConn.db(database).collection("events").deleteOne({ name: eventName });
        console.log(`${deleteResult.deletedCount} evento apagado`);

        // Verificar se o evento foi apagado
        if (deleteResult.deletedCount > 0) {
            // Update dos users
            await dbConn.db(database).collection("users").updateMany(
                {}, //As chavetas significa todos os users
                { $pull: { events: eventName } }
            );
            console.log(`Evento removido dos users`);
        }

        return deleteResult;
    } catch (err) {
        console.error("Erro ao apagar evento: ", err);
        throw err; 
    } finally {
        await dbConn.close();
    }
}

/////////////////funções de apoio////////////////////////
function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return false;
    }
}


/////////////////funções de envio de email////////////////////////
function sendEmail(email) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: emailFrom,
                pass: passwordEmail
            }
        });

        const mailOptions = {
            from: emailFrom,
            to: email,
            subject: 'Welcome to Event Finder',
            text: 'That was easy!'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log("Email error: " + error);
    }

}


app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
