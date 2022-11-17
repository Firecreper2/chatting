"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var socket = require("socket.io");
var apipost = require("./api-calls/post");
var apiget = require("./api-calls/get");
var app = express();
//make the main page static for easy use
app.use("/main", express.static(__dirname + "/src/main"));
app.use(express.json());
var server = http.createServer(app);
var io = new socket.Server(server);
//Set GET api calls
app.get("/api/getmessages", apiget.getMessages);
//Set POST api calls
app.post("/api/login", apipost.login);
app.post("/api/signup", apipost.signup);
app.post("/api/sendmessage", apipost.sendMessage);
//Establish socket.io connection to user page
io.on("connection", function (socket) {
    //Check if a message has been sent
    socket.on("messageSent", function () {
        //Send a message to the user page that they have a new message
        io.emit("messageRecieved");
    });
    socket.on("disconnect", function () {
        return;
    });
});
//Set main page
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/src/main/index.html");
});
//Error handling
app.use(function (req, res) { return res.status(404).send("404 page not found"); });
//Listen!
server.listen(process.env.PORT, function () {
    console.log("it up lol");
});
