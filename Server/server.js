require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const {MongoClient, ServerApiVersion} = require('mongodb');
const nodemailer = require('nodemailer');


const app = express();
const PORT = process.env.PORT;
const secret = process.env.SECRET;
const uri = process.env.DBURI;
const database = process.env.DATABASE;
const emailFrom = process.env.EMAILFROM;

app.use(cors());
app.options('*', cors())
app.use(express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = require('./db/users');
let dados = require('./db/dados');
let favoritos = require('./db/favoritos');



// Criar novo utilizador
app.post("/singUp", (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if (!verifyIfUserExists(username)) 
    {
        if (password.length < 5) 
        {
            return res.status(400).send({msg: 'Password deve ter 5 ou mais caracteres'});
        }
        
        const newUser = {nome:username, e_mail:email, pass:password}
        insertLinesOnDatabase("users", newUser);
        
        //sendEmail(email);
        return res.status(201).send({msg: `Criado utilizador ${username}`});
    } else 
    {
        return res.status(409).send({msg: 'Utilizador já existe'});
    }
});


// Login
app.post("/login", (req, res) => {
    const name = req.body.username;
    const password = req.body.password;
 
    for (user of users) {
        if (user.username === name)
            if (user.password === password) {
                token = jwt.sign(user, secret);
                return res.status(201).json({ auth: true, token: token, msg: "OK" })
            } else {
                return res.status(401).json({ msg: "Password inválida!" })
            }
    }
    return res.status(404).json({ msg: "Utilizador não encontrado!" })
});



//// Acesso à informação somente se autorizado
//app.get("/listarDados", (req, res) => {
//    const decoded = verifyToken(req.header('token'));
//    if (!decoded) {
//        return res.status(401).json({ msg: "Utilizador não autenticado ou não autorizado!" });
//    }
//    const nome = decoded.username;
//    if (dados) {
//        res.status(200).json(dados);
//    } else {
//        res.status(404).json({ msg: "Dados não encontrados!" });
//    }
//});


//funções Base de dados
function insertLinesOnDatabase(table, valuetToInsert)
{
    connectToDB()
    .then((dbConn) => {
        const insert_db = dbConn.db(database);

        insert_db.collection(table).insertOne(valuetToInsert, function(err, res){
            if (err){
                res.send(JSON.stringify(err));
            } else {
                res.send("inserted!");
            }
        });
        disconnectToBD(dbConn);
    })
    .catch((err) => {
        console.error("Error connecting to Database:", err);
    });  
}


async function connectToDB() 
{
    try {
      const dbConn = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          }
        });
        return dbConn;
    }catch(err){
          console.log(err);
      }
}

  
async function disconnectToBD(dbConn)
{
    try{
        await dbConn.close();
    }catch(err)
    {
        console.log(err);
    }
}



//funções de apoio
function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return false;
    }
}


function write(fich, db) {
    fs.writeFile(fich, JSON.stringify(db, null, 4), 'utf8', err => {
        if (err) {
            console.log(`Error writing file: ${err}`)
        } 
    })
}


function verifyIfUserExists(nome) {
    for (user of users)
        if (user.username === nome) {
            return true;
        }
    return false;
}


// send email
//function sendEmail(email)
//{
//    try{
//        const transporter = nodemailer.createTransport({
//            service: 'outlook',
//            auth: {
//              user: '30008432@students.ual.pt',
//              pass: ''
//            }
//          });
//          
//          const mailOptions = {
//            from: emailFrom,
//            to: email,
//            subject: 'Welcome to Event Finder',
//            text: 'That was easy!'
//          };
//          
//          transporter.sendMail(mailOptions, function(error, info){
//            if (error) {
//              console.log(error);
//            } else {
//              console.log('Email sent: ' + info.response);
//            }
//          }); 
//    }catch(err){
//        console.log(`Email error: ${err}`);
//    }
//    
//}

app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});