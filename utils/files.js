const fs = require("fs");
const path = require("path"); 

function createDir(folderName) {
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName, true);
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = createDir