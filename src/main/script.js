// establich socket.io connection
// eslint-disable-next-line no-undef
const socket = io();

//Detect if a message has been sent
socket.on("messageRecieved", () => {
	getMessages();
});

//store data in a variable
let userdata = {
	username: "",
	password: ""
};

//encrypt
const encrypt = async function (text) {
	let buffer = new TextEncoder().encode(text);
	buffer = await crypto.subtle.digest("SHA-256", buffer);
	return Array.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, "0")).join("");
};

//login
const login = async function (user, pass, encrypted = false) {
	const username = user || document.getElementById("username").value;
	let password = document.getElementById("password").value || pass;
	if(!encrypted) password = await encrypt(password);
	// if (encryption) {
	// 	const encrypted = await encrypt(password);
	// }
	const responseText = document.getElementById("response");

	if (username.length < 3 || password.length < 3) {
		responseText.style.color = "orange";
		responseText.innerHTML = "Username and password must be at least 3 characters long";
		return;
	}
	const response = await fetch("/api/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: username,
			password: password
		})
	});
	const content = await response.json();
	console.log(content);

	if (content.message === "Login successful") {
		responseText.style.color = "green";
		responseText.innerHTML = "Login successful. You are logged in as " + username;

		userdata.username = username;
		userdata.password = password;
	} else {
		responseText.style.color = "red";
		responseText.innerHTML = "Username or password is incorrect";
	}
};

//signup
const signup = async function () {
	const username = document.getElementById("username").value;
	const password = await encrypt(document.getElementById("password").value);
	const responseText = document.getElementById("response");

	if (username.length < 3 || password.length < 3) {
		responseText.style.color = "orange";
		responseText.innerHTML = "Username and password must be at least 3 characters long";
		return;
	}
	const response = await fetch("/api/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: username,
			password: password
		})
	});
	const content = await response.json();
	console.log(content);

	if (content.message === "Account created") {
		responseText.style.color = "green";
		responseText.innerHTML = "Signup successful. Please log in.";
		userdata.username = username;
		userdata.password = password;
	} else if (content.message === "Username already exists") {
		responseText.style.color = "red";
		responseText.innerHTML = "Username already exists. Please choose another username.";
	}
};

//send message
const sendMessage = async function (message) {
	if (message.length < 1) return;
	document.getElementById("message-box").value = "";
	//tells the api to send a message
	const response = await fetch("/api/sendMessage", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			message: message,
			username: userdata.username,
			password: userdata.password
		})
	});
	const content = await response.json();
	console.log(content);
	//Tells the server to get the new messages
	socket.emit("messageSent");
};

//get messages
const getMessages = async function () {
	const response = await fetch("/api/getmessages");
	const content = await response.json();
	const messages = document.getElementById("chat-box");
	messages.innerHTML = "";
	for (let i = 0; i < content.length; i++) {
		messages.innerHTML += "<div class='message'>" + content[i] + "</div>";
	}
	//wait so that the items load before scrolling... promises did not go well
	setTimeout(scrollToBottom);
};

//get cookies
const getCookie = function (cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
};

//scroll to bottom
const scrollToBottom = function () {
	setTimeout(() => {
		document.getElementById("chat-box").scrollTo(0, document.getElementById("chat-box").scrollHeight);
	}, 10);
};


// Login buttons
document.getElementById("login-button").addEventListener("click", () => { login(); });
document.getElementById("signup-button").addEventListener("click", () => { signup(); });

// Detects when unfocus happens on the message box
document.getElementById("message-box").addEventListener("focusout", () => sendMessage(document.getElementById("message-box").value));
document.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		sendMessage(document.getElementById("message-box").value);
	}
});

//Load messages
getMessages();

//Periodically check for new messages
setInterval(getMessages, 10000);

//automatically log in if cookie exists
if (getCookie("username") !== "") {
	userdata.username = getCookie("username");
	userdata.password = getCookie("password");
	login(userdata.username, userdata.password, true);
}