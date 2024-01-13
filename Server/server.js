require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
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


/////////////////API Endepoints////////////////////////

// Criar novo utilizador
app.post("/signUp", async (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const findUserName = await findOneResult("users", { username: username });

    if (findUserName == null) {
        if (password.length < 5) {
            return res.status(400).send({ msg: 'Password deve ter 5 ou mais caracteres' });
        }

        // Hash password with bcrypt
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = { username: username, email: email, password: hashedPassword, events: [] };
           
            await insertLinesOnDatabase("users", newUser);

            sendEmail(email);
            return res.status(201).send({ msg:""});
        } catch (error) {
            console.error("Erro ao criar o utilizador: " + error);
            return res.status(500).send({ msg:'Erro ao criar utilizador'});
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
                return res.status(500).json({ msg: "Erro de Servidor" });
            }

            if (isMatch) {           
                const user = { username: name, password: findUser.password };
                const token = jwt.sign(user, secret);
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
    //verificar se existe um utilizador logado
    userAuthorization(req.header('token'));

    //Adição do evento ao utilizador
    const userName = decoded.username;
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

})


// registeredEvents   não existe necessidade de verificar token os eventos registados qualquer um pode ver
app.get("/registeredEvents", async (req, res) => {
    const eventsList = await findAll("events");
    return res.json({ resultSet: eventsList });
});

// endpoint utilizado para fazer uma pesquisa de eventos especifica
app.post("/searchForEvents", async (req, res) => {
    const event = req.body;
    const eventsList = await findEvent(event);
    return res.json({ resultSet: eventsList });
});

//endpoint utilizado para receber os eventos de um utilizador
app.post("/myEvents", async (req, res) => {
    userAuthorization(req.header('token'));

    //const eventsList = await findAll("events");
    return res.json({ resultSet: eventsList });
});

//endpoint para utilizado para obter os detalhes de determinado evento
app.post("/eventDetails", async (req, res) => {
    const eventName = req.body.event;

    const eventInfo = await findOneResult("events", { name: eventName });
    return res.json({ resultSet: eventInfo });
});

//endpoint utilizado para remoção de eventos
app.delete("/deleteEvent", async (req, res) => {
    userAuthorization(req.header('token'));
    
    const eventName = req.body.eventName; // Nome do evento deve vir no body, caso não venha é somente necessário introduzir variável de entrada

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
});


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

async function findOneResult(table, findWhat) {
    const dbConn = new MongoClient(uri);

    try {
        const findResult = await dbConn.db(database).collection(table).findOne(findWhat);
        await dbConn.close();
        return findResult;
    } catch (err) {
        console.log(err);
    } finally {
        await dbConn.close();
    }
}

//Função para obter os objetos todos de uma tabela
async function findAll(table) {
    const dbConn = new MongoClient(uri);

    try {
        const findResult = await dbConn.db(database).collection(table).find({}).toArray();
        await dbConn.close();
        return findResult;
    } catch (err) {
        console.log(err);
    } finally {
        await dbConn.close();
    }
}

async function findEvent(event){
    const dbConn = new MongoClient(uri);

    try {
        const findResult = await dbConn.db(database).collection("events").find({name: new RegExp('^' + event.searchEvent) }).toArray();
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
        const deleteResult = await dbConn.db(database).collection("events").deleteOne({ name: eventName });
        
        console.log(`${deleteResult.deletedCount} event(s) was/were deleted.`);
        return deleteResult;
    } catch (err) {
        console.error("Error deleting event: ", err);
        throw err; // Rethrowing the error is important for error handling in calling functions.
    } finally {
        await dbConn.close();
    }
}

/////////////////funções de apoio////////////////////////
function userAuthorization(token){
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ msg: "Utilizador não autenticado ou não autorizado!" });
    }
}
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
