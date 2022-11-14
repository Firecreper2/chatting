const fs = require("fs");

const getMessages = async function (req,res) {
	let rootDir = __dirname.split("\\");
	rootDir.pop();
	rootDir = rootDir.join("\\")
	const messages = JSON.parse(fs.readFileSync("./messages.json"));
	res.send(messages);
};

module.exports = { getMessages };
