import * as express from "express";
import * as http from "http";
import * as socket from "socket.io";
import * as apipost from "./api-calls/post";
import * as apiget from "./api-calls/get";

const app = express();
//make the main page static for easy use
app.use("/main", express.static(__dirname + "/src/main"));
app.use(express.json());
const server = http.createServer(app);
const io = new socket.Server(server);

//Set GET api calls
app.get("/api/getmessages", apiget.getMessages);

//Set POST api calls
app.post("/api/login", apipost.login);
app.post("/api/signup", apipost.signup);
app.post("/api/sendmessage", apipost.sendMessage);

//Establish socket.io connection to user page
io.on("connection", (socket) => {
	//Check if a message has been sent
	socket.on("messageSent", () => {
		//Send a message to the user page that they have a new message
		io.emit("messageRecieved");
	});
	socket.on("disconnect", () => {
		return;
	});
});

//Set main page
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/src/main/index.html");
});

//Error handling
app.use((req, res) => res.status(404).send("404 page not found"));

//Listen!
server.listen(8080, () => {
	console.log("it up lol");
});