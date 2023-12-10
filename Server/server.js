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
const emailFrom = process.env.EMAILFROM;

app.use(cors());
app.options('*', cors())
app.use(express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = require('./db/users');
let dados = require('./db/dados');
let favoritos = require('./db/favoritos');

const dbConn = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

app.get("/getToken", (req, res) => {
    res.send()

});

// Create new User
app.post("/register", (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if (!verifyIfUserExists(username)) 
    {
        if (password.length < 5) 
        {
            return res.status(400).send({msg: 'Password deve ter 5 ou mais caracteres'});
        }

        const newUser = {sername: username, password: password, tipo: 0}
        users.push(newUser);
        write("./db/users.json", users);

        //codigo de insert na base de dados
        var insert_db = dbConn.db("Devweb");

        insert_db.collection("Users").insertOne({nome:username,e_mail:email,pass:password}, function(err, res2){
        dbConn.close();
            if (err){
                res.send(JSON.stringify(err));
            } else {
                res.send("inserted!");
            }
        });
        // termina aqui
        
        sendEmail(email);
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

    console.log(name);
    console.log(password);
 
    for (user of users) {
        if (user.username === name)
            if (user.password === password) {
                console.log("ntre");
                token = jwt.sign(user, secret);
                return res.status(201).json({ auth: true, token: token, msg: getFavoritos(user.username) })
            } else {
                return res.status(401).json({ msg: "Password inválida!" })
            }
    }
    return res.status(404).json({ msg: "Utilizador não encontrado!" })
});

// Acesso à informação somente se autorizado
app.get("/listarDados", (req, res) => {
    const decoded = verifyToken(req.header('token'));
    if (!decoded) {
        return res.status(401).json({ msg: "Utilizador não autenticado ou não autorizado!" });
    }
    const nome = decoded.username;
    if (dados) {
        res.status(200).json(dados);
    } else {
        res.status(404).json({ msg: "Dados não encontrados!" });
    }
});

function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return false;
    }
}

function getFavoritos(username) {
    let lista = "<h3>Favoritos do utilizador " + username + "</h3><br>";
    for (fav of favoritos){
        if (fav.Username === username){
            let id = fav.DadoId;
            for (dad of dados){
                if (dad.id === id){
                    lista += "Id: " + dad.id + " - Nome: " + dad.nome + "<br/>";
                    break;
                }
            }
        }
    }
    return lista;
}

function write(fich, db) {
    fs.writeFile(fich, JSON.stringify(db, null, 4), 'utf8', err => {
        if (err) {
            console.log(`Error writing file: ${err}`)
        } else {
            console.log('Escreveu no ficheiro ' + fich); // Sucesso
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


async function connectToDB() {
  try {
    await dbConn.connect();
    await dbConn.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }catch(err){
        console.log(err);
    }
}



async function disconnectToBD()
{
    await dbConn.close();
}


// send email
function sendEmail(email)
{
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: '30008432@students.ual.pt',
          pass: ''
        }
      });
      
      const mailOptions = {
        from: emailFrom,
        to: email,
        subject: 'Welcome to Event Finder',
        text: 'That was easy!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 
}







app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connectToDB();
});