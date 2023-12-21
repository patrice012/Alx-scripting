const openConceptLinks = require("./conceptLinks");
const createPDF = require("../utils/createPDF");
const createDir = require("../utils/files");
const removeUnwantedTags = require("../utils/removeTags");
const { getPdfName } = require("../utils/formatPDFName");

async function processLinksSequentially(links, browser, cookies) {
    for (const link of links) {
        await (async () => {
            /* PROJECT LINKS */
            const projectBW = await browser.createIncognitoBrowserContext();
            const projectPage = await projectBW.newPage();
            await projectPage.setCookie(...cookies);
            await projectPage.goto(link, { timeout: 0 });

            // format PDF name based on project name
            const pdfName = await getPdfName(projectPage, 'h1[class="gap"]');

            await removeUnwantedTags(projectPage);

            /* create directory for the project */
            let dirName = `Project-${pdfName}-dir`;
            await createDir(dirName);
            let dirPath = `pdf/${dirName}/${pdfName}`;
            await createPDF(projectPage, dirPath);

            /* PROCESS EACH LINKS IN THE CONCEPTS SECTION */
            await openConceptLinks(projectPage, browser, dirName);

            // close browser window
            await projectBW.close();
        })();

        // Introduce a delay between iterations
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

module.exports = processLinksSequentially;
