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
    const myObject = {
        names: {
            firstName: 'Miguel',
            lastName: 'Rico'
        }
    }

    res.send(JSON.stringify(myObject));
});

app.post("/myPost", (req, res) => {
    const { firstName, lastName } = req.body.employees;
    console.log(req.body);
    console.log("First Name: " + firstName);
    console.log("Last Name: " + lastName);

    res.send("Success");
});

app.listen(3000, () => console.log("API is running..."));


