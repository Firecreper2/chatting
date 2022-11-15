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
	let time = Date().toLocaleString()
		.split(" ")[4] // get the time in the format "HH:MM:SS"
		.split(":"); // split the time into an array
	const message = req.body.message;
	const username = req.body.username;
	const password = req.body.password;
	if (!verifyAccount(username, password)) {
		res.send({ "message": "Invalid account credentials" });
		return;
	}
	//using 12 hour time, with time[0] being the hour
	let AMPM = "";
	if (time[0] >= 12) {
		//allow 12 PM
		if(time != "12") time -= 12;
		AMPM = "PM";
	} else {
		//remove 00 AM
		if(time[0] == "00") time[0] = "12";
		AMPM = "AM";
	}
	//create message
	let messageParsed = "[" + time[0] + ":" + time[1] + " " + AMPM + "] " + username + ": " + message;
	let messages = fs.readFileSync("./messages.json");
	messages = JSON.parse(messages);
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
