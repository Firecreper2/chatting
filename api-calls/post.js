const fs = require("fs");
let previousDirectory = __dirname.split("\\");
previousDirectory.pop();
previousDirectory = previousDirectory.join("\\");
async function login(req, res) {
	const username = req.body.username;
	const password = req.body.password;
	let valid = false;
	const accounts = JSON.parse(fs.readFileSync("./accounts.json"));
	Object.keys(accounts).forEach(account => {
		if (accounts[account].username === username && accounts[account].password === password) {
			res.cookie("username", username);
			res.cookie("password", password);
			res.send({ "message": "Login successful" });
			valid = true;
		}
	});
	if (!valid) res.send({ "message": "Login failed" });
}
const signup = async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	let valid = true;
	//get all accounts
	let accounts = JSON.parse(fs.readFileSync("./accounts.json"));
	console.log(accounts)

	//iterate for each account to see if the username is already
	//in use
	Object.keys(accounts).forEach(account => {
		console.log(accounts)
		if (accounts[account].username === username) {
			res.send({ "message": "Username already exists" });
			valid = false;
		}
	});
	if (!valid) return;
	//create new account index
	accounts[username] = {};
	accounts[username].username = username;
	accounts[username].password = password;
	console.log(accounts)
	//replace old json with new one!
 	fs.writeFileSync("./accounts.json", JSON.stringify(accounts, null, 4));
	//send 400
	res.send({ "message": "Account created" });
};

const sendMessage = async (req, res) => {
	let time = new Date()
	let hour = time.getHours()
	let minute = time.getMinutes()
	const message = req.body.message;
	const username = req.body.username;
	const password = req.body.password;
	if (!verifyAccount(username, password)) {
		res.send({ "message": "Invalid account credentials" });
		return;
	}
	let AMPM = "";
	//convert hour to EST
	hour = hour + (time.getTimezoneOffset()/60) - 5
	if (hour >= 12) {
		//allow 12 PM
		if(hour != 12) hour -= 12;
		AMPM = "PM";
	} else {
		//remove 00 AM
		if(hour == "00") hour = 12;
		AMPM = "AM";
	}
	if (hour < 10){
		hour = "0"+hour
	}
	if (minute < 10){
		minute = "0"+minute
	}
	//create message
	console.log(username+" sent "+message+" at " + hour + ":" + minute + " " + AMPM)
	let messageParsed = "[" + hour + ":" + minute + " " + AMPM + "] " + username + ": " + message;
	let messages = fs.readFileSync("./messages.json");
	messages = JSON.parse(messages);
	if(messages.length > 99){
		messages.shift()
	}
	messages.push(messageParsed);
	fs.writeFileSync("./messages.json", JSON.stringify(messages, null, 4));
	res.send({ "message": "Message sent" });
};
const verifyAccount = (username, password) => {
	if (!username || !password) return false;
	const accounts = fs.readFileSync("./accounts.json");
	const accountsJSON = JSON.parse(accounts);
	return accountsJSON[username].password === password;
};
module.exports = { login, signup, sendMessage };
