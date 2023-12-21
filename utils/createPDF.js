// create PDF based on HTML content
const path = require("path");

async function createPDF(projectPage, dirPath) {
    await projectPage.pdf({
        path: path.normalize(dirPath),
        printBackground: true,
        format: "A4",
    });
}
module.exports = createPDF;
