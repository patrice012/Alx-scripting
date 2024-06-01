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
  try {
    // Set page cookies
    await page.setCookie(...cookies);

    // Navigate to project page
    await page.goto(url, { waitUntil: "load" });

    // Format PDF name based on project name
    let pdfName;
    if (url.includes("/evaluation_quiz_corrections/")) {
      pdfName = await getPdfName(page, "article > p");
    } else {
      pdfName = await getPdfName(page, 'h1[class="gap"]');
    }

    // Remove unwanted tags
    await removeUnwantedTags(page);

    // Create directory for the project
    const dirName = `${PDF_ROUTE}/${curriculumType}/Project-${pdfName.trim()}-dir`;
    await createDir(dirName);

    try {
      // Remove unwanted tags
      await removeUnwantedTags(page);
    } catch (error) {
      console.log("Error removing unwanted tags:", error);
    }

    // Create PDF path
    const pdfPath = `${dirName}/${pdfName}`;
    await createPDF(page, pdfPath);

    // Scrape all links in the project's concept page
    let links = [];
    if (!url.includes("/evaluation_quiz_corrections/")) {
      await page.waitForSelector('div[class="panel panel-default"]');
      links = await page.$$eval(
        'div[class="panel panel-default"] a',
        (links) => {
          return links.map((link) => link.href).filter((href) => href);
        }
      );

      const siteUrl = await page.evaluate(() => window.location.href);

      const reqData = {
        name: pdfName,
        projectLink: url === siteUrl.trim() ? url : siteUrl.trim(),
        curriculum: curriculumType,
        resources: [...links],
        dirName,
        conceptPageName: pdfName,
      };

      try {
        const serverRes = await postRequest("/api/v1/project", reqData);
        console.log("Project data posted to server:", serverRes);
      } catch (error) {
        console.log("Error posting project data to server:", error);
      }
    }

    return { dirName, links, conceptPageName: pdfName };
  } catch (error) {
    console.log("Error in scraping concept page:", error);
    return { dirName: null, links: [], conceptPageName: "" };
  }
};

// scraping resources  page
const scrapingConceptPageResources = async (
  page,
  url,
  dirName,
  conceptPageName
) => {
  console.log("Scraping resources for: ", url);

  const loginAndNavigate = async () => {
    try {
      await page.goto(url, { waitUntil: "load" });
      const login = await loginProcess(page);

      if (login) {
        console.log("Logged in");
        await page.goto(url, { waitUntil: "load" });
        return true;
      } else {
        console.log("Not logged in, trying again after 3 seconds");

        await sleep(3000);

        let siteUrl = await page.evaluate(() => window.location.href);
        if (siteUrl.includes("https://intranet.alxswe.com/auth/sign_in")) {
          console.log("Trying to login again");
          await page.reload({ waitUntil: "networkidle0" });
          const loginRetry = await loginProcess(page);

          if (loginRetry) {
            console.log("Logged in");
            await page.goto(url, { waitUntil: "load" });
            return true;
          }
        }
      }
    } catch (error) {
      console.log(error, "error during login and navigation");
      return false;
    }
    return false;
  };

  if (url.includes("https://intranet.alxswe.com")) {
    const loginSuccess = await loginAndNavigate();
    let siteUrl = await page.evaluate(() => window.location.href);
    if (
      !loginSuccess &&
      siteUrl.includes("https://intranet.alxswe.com/auth/sign_in")
    ) {
      return;
    }
  }

  let links = [];
  let pdfName = "";

  if (url.includes("https://intranet.alxswe.com/concepts")) {
    const target = 'h1[class="d-flex flex-column gap-2"] > span';
    pdfName = await getPdfName(page, target);

    await removeUnwantedTags(page);

    links = await page.$$eval("#curriculum_navigation_content a", (links) => {
      return links.map((link) => link.href).filter((href) => href);
    });
  } else {
    pdfName = await page.evaluate(() => {
      let name = document.title
        .trim()
        .replace(/[\\'.,\/\s]+/g, "-")
        .replace(/-+/g, "-")
        .split("-")
        .slice(0, 8)
        .join("-")
        .replace(/[\\'.,\/\s]+/g, "-");
      if (!name.length) {
        name = "default-name";
      }
      return name + ".pdf";
    });
  }

  try {
    await createDir(dirName);
  } catch (error) {
    console.log(error, "error creating directory");
  }

  try {
    await removeUnwantedTags(page);
  } catch (error) {
    console.log(error, "error removing unwanted tags");
  }

  let siteUrl = await page.evaluate(() => window.location.href);

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

  if (url.includes("https://www.youtube.com/")) {
    console.log("Youtube video, wait 20s for load");
    await sleep(20000);
  }
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

  try {
    const serverRes = await postRequest("/api/v1/resource", reqData);
    console.log("Resource data posted to server");
  } catch (error) {
    console.log("Error posting resource data to server:", error);
  }
};

module.exports = {
  scrapingConceptPage,
  scrapingConceptPageResources,
};
