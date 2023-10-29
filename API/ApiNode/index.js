const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { v4: uuid } = require("uuid");
const bodyParser = require("body-parser")

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
  }));

  
app.get("/myGet", (req, res) => {
    const arr = ["teste", "teste2", "teste3"];
    res.json(arr);
});

app.post("/myPost", (req, res) => {
    const jsonData = req.body;
    console.log(jsonData);
    res.sendStatus(201);
});

app.listen(3000, () => console.log("API is running..."));


