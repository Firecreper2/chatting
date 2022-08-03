// establich socket.io connection
// eslint-disable-next-line no-undef
const socket = io();

//Detect if a message has been sent
socket.on("messageRecieved", () => {
	getMessages();
});

let userdata = {
	username: "",
	password: ""
};

const login = async function () {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;
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
		responseText.innerHTML = "Login failed";
	}
};

const signup = async function () {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;
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

const sendMessage = async function (message) {
	if(message.length < 1) return;
	if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
		document.getElementById("message").focus();
	}
	document.getElementById("message-box").value = "";
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
	socket.emit("messageSent");
};

const getMessages = async function () {
	const response = await fetch("/api/getmessages");
	const content = await response.json();
	const messages = document.getElementById("chat-box");
	console.log(response);
	messages.innerHTML = "";
	for (let i = 0; i < content.length; i++) {
		messages.innerHTML += "<div class='message'>" + content[i] + "</div>";
	}
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