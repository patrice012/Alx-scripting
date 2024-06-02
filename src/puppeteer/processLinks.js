// handles concept links
const openConceptLinks = require("./conceptLinks");
//utils
const createPDF = require("../utils/createPDF");
const { createDir } = require("../utils/files");
const removeUnwantedTags = require("../utils/removeTags");
const { getPdfName } = require("../utils/formatPDFName");
const { loadCookies } = require("../utils/cookies");

async function processLinksSequentially(links, browser, typeCur) {
  for (const link of links) {
    await (async () => {
      /* PROJECT LINKS */
      // const projectBW = await browser.createIncognitoBrowserContext();
      const projectPage = await browser.newPage();

      // get saved cookies
      const cookies = await loadCookies();
      await projectPage.setCookie(...cookies);

      // navigate to project page
      await projectPage.goto(link, { timeout: 0 });

      // format PDF name based on project name
      const pdfName = await getPdfName(projectPage, 'h1[class="gap"]');

      // remove unwanted tags
      await removeUnwantedTags(projectPage);

      /* create directory for the project */
      let dirName = `pdf/${typeCur}/Project-${pdfName}-dir`;
      await createDir(dirName);
      let dirPath = `${dirName}/${pdfName}`;
      await createPDF(projectPage, dirPath);

      /* process each links in concept section */
      await openConceptLinks(projectPage, browser, dirName);

      // close browser window
      await projectBW.close();
    })();

    // Introduce a delay between iterations
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = processLinksSequentially;
