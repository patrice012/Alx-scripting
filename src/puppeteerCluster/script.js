const createPDF = require("../../utils/createPDF");
const { createDir, writeToFile } = require("../../utils/files");
const removeUnwantedTags = require("../../utils/removeTags");
const { getPdfName } = require("../../utils/formatPDFName");
const postRequest = require("../../utils/postReq");
const loginProcess = require("../auth/auth");
const { sleep } = require("../../utils/sleep");

const { PDF_ROUTE } = require("../../config");

// scraping project's concept page
const scrapingConceptPage = async (page, url, cookies, curriculumType) => {
  // set pages cookies
  await page.setCookie(...cookies);

  // navigate to project page
  await page.goto(url, { timeout: 0 });

  // format PDF name based on project name
  const pdfName = await getPdfName(page, 'h1[class="gap"]');

  // remove unwanted tags
  await removeUnwantedTags(page);

  /* create directory for the project */
  let dirName = `${PDF_ROUTE}/${curriculumType}/Project-${pdfName.trim()}-dir`;
  await createDir(dirName);

  try {
    // remove unwanted tags
    await removeUnwantedTags(page);
  } catch (error) {
    console.log(error, "error");
  }

  // create pdf name
  await createDir(dirName);
  let dirPath = `${dirName}/${pdfName}`;
  await createPDF(page, dirPath);

  // Scrap all links in the project's concept page
  /* get all links */
  await page.waitForSelector('div[class="panel panel-default"]');
  const links = await page.$$eval(
    'div[class="panel panel-default"] a',
    (links) => {
      let validHrefs = [];
      links.forEach((link) => {
        if (link.href) validHrefs.push(link.href);
      });
      return validHrefs;
    }
  );

  let siteUrl = await page.evaluate(() => window.location.href);

  const reqData = {
    name: pdfName,
    projectLink: url === siteUrl.trim() ? url : siteUrl.trim(),
    curriculum: curriculumType,
    resources: [...links],
    dirName,
    conceptPageName: pdfName,
  };

  const serverRes = await postRequest("/api/v1/project", reqData);
  // console.log(serverRes, "serverRes");

  return { dirName, links, conceptPageName: pdfName };
};

const scrapingConceptPageResources = async (
  page,
  url,
  dirName,
  conceptPageName
) => {
  console.log("Scraping resources for: ", url);
  try {
    // navigate to project page
    await page.goto(url, { timeout: 0 });
    // login
    const login = await loginProcess(page);
    if (login) {
      console.log("Logged in");
      await page.goto(url, { timeout: 0 });
    } else {
      console.log("Not logged in, trying again afetr 5 seconds");

      await sleep(5000);
      let siteUrl = await page.evaluate(() => window.location.href);

      if (siteUrl.includes("https://intranet.alxswe.com/auth/sign_in")) {
        console.log("Login required for url: ", url);
        console.log("Trying to login again");

        const login = await loginProcess(page);
        if (login) {
          console.log("Logged in");
          await page.goto(url, { timeout: 0 });
        } else {
          console.log("Not logged in");
          return;
        }
      }
    }
  } catch (error) {
    console.log(error, "error");
  }

  // format PDF name based on project name
  let links = [];
  let mediaUrls = [];
  let pdfName = "";
  if (url.includes("https://intranet.alxswe.com/concepts")) {
    const target = 'h1[class="d-flex flex-column gap-2"] > span';
    pdfName = await getPdfName(page, target);

    await removeUnwantedTags(page);

    links = await page.$$eval("#curriculum_navigation_content a", (links) => {
      let validHrefs = [];
      links.forEach((link) => {
        if (link.href) validHrefs.push(link.href);
      });
      return validHrefs;
    });
  } else {
    /* Use the document title as pdf name */
    pdfName = await page.evaluate(() => {
      let name = document.title
        .trim()
        .replace(/[\\'.,\/\s]+/g, "-")
        .replace(/-+/g, "-")
        .split("-")
        .slice(0, 8)
        .join("-")
        .replace(/[\\'.,\/\s]+/g, "-");
      if (!name.length >= 1) {
        name = "default-name";
      }
      return name + ".pdf";
    });
  }

  try {
    // /* create directory for the project */
    await createDir(dirName);
  } catch (error) {
    console.log(error, "error");
  }

  try {
    // remove unwanted tags
    await removeUnwantedTags(page);
  } catch (error) {
    console.log(error, "error");
  }

  let siteUrl = await page.evaluate(() => window.location.href);

  /* Check if it's an amazon assets */
  if (siteUrl.includes("amazon.com")) {
    console.log("Amazon assets, skipping pdf creation");
    return;
  }

  if (siteUrl.includes("https://intranet.alxswe.com/auth/sign_in")) {
    console.log("Login required for url: ", url);
    console.log("Can't create pdf for this link, skipping pdf creation");
    return;
  }

  let pdfPath = `${dirName}/${pdfName}`;

  await createPDF(page, pdfPath);

  const reqData = {
    name: pdfName,
    link: siteUrl,
    type: siteUrl.includes("https://intranet.alxswe.com/concepts")
      ? "ALX"
      : "External",
    project: conceptPageName,
    relatedLinks: [...links],
  };

  const serverRes = await postRequest("/api/v1/resource", reqData);
};

module.exports = {
  scrapingConceptPage,
  scrapingConceptPageResources,
};
