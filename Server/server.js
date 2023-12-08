const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();

const PORT = 3000;
const SECRET = "fdçlkjdflkjdslfkgjdfkgºpçdfkpdrkgpdrgjkpfkmfdçl";


app.use(cors());
app.options('*', cors()) // include before other routes

app.use(express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = require('./db/users');
let dados = require('./db/dados');
let favoritos = require('./db/favoritos');

function escreve(fich, db) {
    fs.writeFile(fich, JSON.stringify(db, null, 4), 'utf8', err => {
        if (err) {
            console.log(`Error writing file: ${err}`)
        } else {
            console.log('Escreveu no ficheiro ' + fich); // Sucesso
        }
    })
}

function existeUser(nome) {
    for (utilizador of users)
        if (utilizador.username === nome) {
            return true;
        }
    return false;
}
//
// Registo de um novo utilizador
app.post("/registar", (req, res) => {
    const username = req.body.username;
    if (!existeUser(username)) {
        const newUser = {
            username: username,
            password: req.body.password,
            tipo: 0
        }
        if (newUser.password.length < 5) {
            return res.status(400).send({
                msg: 'Password deve ter 5 ou mais caracteres'
            });
        }
        users.push(newUser);
        escreve("./db/users.json", users);
        return res.status(201).send({
            msg: `Criado utilizador ${username}`
        });
    } else {
        return res.status(409).send({
            msg: 'Utilizador já existe'
        });
    }
});

// Login
app.post("/login", (req, res) => {
    const nome = req.body.username;
    const senha = req.body.password;
    for (utilizador of users) {
        if (utilizador.username === nome)
            if (utilizador.password === senha) {
                token = jwt.sign(utilizador, SECRET);
                return res.status(201).json({ 
                    auth: true, 
                    token: token,
                msg: getFavoritos(utilizador.username) })
            } else {
                return res.status(401).json({ msg: "Password inválida!" })
            }
    }
    return res.status(404).json({ msg: "Utilizador não encontrado!" })
});

function validarToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return false;
    }
}

// Acesso à informação somente se autorizado
app.get("/listarDados", (req, res) => {
    const decoded = validarToken(req.header('token'));
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

app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});