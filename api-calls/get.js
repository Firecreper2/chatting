const fs = require("fs");

const getMessages = async function (req,res) {
	const messages = JSON.parse(fs.readFileSync("./messages.json"));
	res.send(messages);
};

module.exports = { getMessages };