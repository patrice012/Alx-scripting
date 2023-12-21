const fs = require("fs");

async function createDir(folderName) {
    try {
        if (!fs.existsSync("pdf")) {
            fs.mkdirSync("pdf", true);
        }
        if (!fs.existsSync(`pdf/${folderName}`)) {
            fs.mkdirSync(`pdf/${folderName}`, true);
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = createDir;
