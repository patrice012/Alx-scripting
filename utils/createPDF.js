// create PDF based on HTML content
async function createPDF(projectPage, pdfName) {
    await projectPage.pdf({
        path: pdfName,
        printBackground: true,
        format: "A4",
    });
}
module.exports = createPDF;
