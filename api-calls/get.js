const fs = require("fs");

const getMessages = async function (req,res) {
	let rootDir = __dirname.split("\\");
	rootDir.pop();
	rootDir = rootDir.join("\\");
	console.log(rootDir+" # messagesfolder")
	const messages = JSON.parse(fs.readFileSync(rootDir+"\\messages.json"));
	res.send(messages);
};

module.exports = { getMessages };
