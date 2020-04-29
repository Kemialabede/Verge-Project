const express = require("express");
const bycrpt = require("bcrypt");
const bodyParser = require("body-parser");
const db = require("./database");
const vergeRoute = require("./route")

let app = express();
let port = 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.listen(port, () =>{
    console.log("Application Listening on Port 5000")
});
app.get('/', (req, res) =>{
    return res.status(200).json({
        message: "Welcome to Verge"
    })
})
app.use("/api/v1", vergeRoute);

module.exports = app