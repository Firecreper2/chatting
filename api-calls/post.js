const fs = require("fs");
let previousDirectory = __dirname.split("\\");
previousDirectory.pop();
previousDirectory = previousDirectory.join("\\");
async function login(req, res) {
	const username = req.body.username;
	const password = req.body.password;
	let valid = false;
	const accounts = JSON.parse(fs.readFileSync(previousDirectory + "\\accounts.json"));
	Object.keys(accounts).forEach(account => {
		if (accounts[account].username === username && accounts[account].password === password) {
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
	const accounts = JSON.parse(fs.readFileSync(previousDirectory + "\\accounts.json"));

	Object.keys(accounts).forEach(account => {
		if (accounts[account].username === username) {
			res.send({ "message": "Username already exists" });
			valid = false;
		}
	});
	if (!valid) return;
	accounts[username] = {};
	accounts[username].username = username;
	accounts[username].password = password;
	fs.writeFileSync(previousDirectory + "\\accounts.json", JSON.stringify(accounts, null, 4));
	res.send({ "message": "Account created" });
};

const sendMessage = async (req, res) => {
	const time = Date().toLocaleString()
		.split(" ")[4] // get the time in the format "HH:MM:SS"
		.split(":"); // split the time into an array
	const message = req.body.message;
	const username = req.body.username;
	const password = req.body.password;
	if (!verifyAccount(username, password)) {
		res.send({ "message": "Invalid account credentials" });
		return;
	}
	let messageParsed = "[" + time[0] + ":" + time[1] + "] " + username + ": " + message;
	let messages = fs.readFileSync(previousDirectory + "/messages.json");
	messages = JSON.parse(messages);
	messages.push(messageParsed);
	fs.writeFileSync(previousDirectory + "/messages.json", JSON.stringify(messages, null, 4));
	res.send({ "message": "Message sent" });
};
const verifyAccount = (username, password) => {
	const accounts = fs.readFileSync(previousDirectory + "/accounts.json");
	const accountsJSON = JSON.parse(accounts);
	return accountsJSON[username].password === password;
};
module.exports = { login, signup, sendMessage };
