const { Cluster } = require("puppeteer-cluster");

// base config
const { BASE_URL, broswerView } = require("../../config");

// auth
const loginProcess = require("../auth/auth");

// utils
const debug = require("../../utils/debug");
const { loadCookies, saveCookies } = require("../../utils/cookies");
const createPDF = require("../../utils/createPDF");
const { createDir, writeToFile } = require("../../utils/files");
const removeUnwantedTags = require("../../utils/removeTags");
const { getPdfName } = require("../../utils/formatPDFName");
const postRequest = require("../../utils/postReq");

const scrapData = async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 4,
    timeout: 960000,
    retryLimit: 2,
    retryDelay: 5000,
    monitor: true,
    puppeteerOptions: broswerView,
  });

  // log on dev mode
  debug(cluster);

  let state = {
    error: false,
    links: [],
    conceptLinks: [],
    cookies: [],
  };

  let analytics = {
    totalLinks: [],
    totalConceptLinks: [],
  };

  // Visiting the home page and login if needed
  await cluster.queue(async ({ page }) => {
    const url = new URL(BASE_URL);
    try {
      state.cookies = loadCookies();

      console.log(state.cookies, "state.cookies");

      if (!state.cookies) {
        // go to login page
        await page.goto(url, { timeout: 0 });

        // login
        await loginProcess(page);

        // get cookies
        let cookies = await page.cookies();
        state.cookies = cookies;

        // save cookies for the next time
        saveCookies(cookies);
      } else {
        let _cookies = state.cookies;
        console.log(_cookies, "cookies");
        await page.setCookie(..._cookies);
        await page.goto(url, { timeout: 0 });
        // get cookies
        let cookies = await page.cookies();
        state.cookies = cookies;

        // save cookies for the next time
        saveCookies(cookies);
      }
    } catch (error) {
      state.error = error;
      console.log(error, "error");
    }

    state.cookies = await page.cookies();
    console.log(state.cookies, "cookies saved");

    if (state.error) {
      console.log(state.error, "error");
      return;
    }

    // const curriculumDropdownItems = await getCurriculumnTypes(page);

    await foundationCurriculumScraping(cluster, page);

    await specialisationCurriculumScraping(cluster, page);
  });

  await cluster.idle();
  await cluster.close();
};

scrapData();

// module.exports = scrapData;

// specialisation and foundation curriculum scraping
const getCurriculumnTypes = async (page) => {
  // select the cursus type
  await page.waitForSelector("#student-switch-curriculum-dropdown", {
    visible: true,
  });

  const cursusTypeBox = await page.$("#student-switch-curriculum-dropdown");
  await cursusTypeBox.click();

  console.log("cursusTypeBox clicked", cursusTypeBox);

  const curriculumDropdownItems = await page.$$(
    'ul[aria-labelledby="student-switch-curriculum-dropdown"] li'
  );

  console.log(curriculumDropdownItems, "curriculumDropdownItems");
  return curriculumDropdownItems;
};

//  for specialisation and foundation links
const getSpecialisationsLinks = async (page) => {
  // for specialisation page
  await page.waitForSelector('a[data-target="#period_scores_modal_17"]', {
    visible: true,
  });
  const specialisationModalBox = await page.$(
    'a[data-target="#period_scores_modal_17"]'
  );
  await specialisationModalBox.click();
  // get specialisation links
  const specialisationLinks = await page.$$eval(
    'table[class="table"]',
    (table) => {
      let specialisationTable = table[0];
      let links = Array.from(specialisationTable.querySelectorAll("a"));
      return links.map((link) => link.href);
    }
  );
  return specialisationLinks;
};

const getFoundationLinks = async (page) => {
  // for fondation page
  await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
    visible: true,
  });
  const fondationModalBox = await page.$(
    'a[data-target="#period_scores_modal_1"]'
  );
  await fondationModalBox.click();

  // get fondation links
  const foundationLinks = await page.$$eval('table[class="table"]', (table) => {
    let foundationTable = table[1];
    let links = Array.from(foundationTable.querySelectorAll("a"));
    return links.map((link) => link.href);
  });

  return foundationLinks;
};

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
  let dirName = `pdf/${curriculumType}/Project-${pdfName}-dir`;
  await createDir(dirName);

  // create pdf name
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

  const reqData = {
    name: pdfName,
    curriculum: curriculumType,
    resources: [...links],
  };

  const serverRes = await postRequest("/api/v1/project", reqData);

  console.log(serverRes, "serverRes");

  return { dirName, links, conceptPageName: pdfName };
};

const scrapingConceptPageResources = async (
  page,
  url,
  cookies,
  dirName,
  conceptPageName
) => {
  // set pages cookies
  await page.setCookie(...cookies);

  // navigate to project page
  await page.goto(url, { timeout: 0 });

  // format PDF name based on project name
  let pdfName = "";
  if (url.includes("https://intranet.alxswe.com/concepts")) {
    const target = 'h1[class="d-flex flex-column gap-2"] > span';
    pdfName = await getPdfName(page, target);

    await removeUnwantedTags(page);
  } else {
    /* Use the document title as pdf name */
    pdfName = await page.evaluate(() => {
      let name = document.title
        .trim()
        .slice(0, 55)
        .replace(/[\\'.,\/\s]+/g, "-")
        .replace(/-+/g, "-");
      if (!name.length >= 1) {
        name = "default-name";
      }
      return name + ".pdf";
    });
  }

  /* create directory for the project */
  await createDir(dirName);

  let pdfPath = `${dirName}/${pdfName}`;
  /* Check if it's an amazon assets */
  await createPDF(page, pdfPath);

  let siteUrl = await page.evaluate(() => window.location.href);
  const reqData = {
    name: pdfName,
    link: siteUrl,
    type: url.includes("https://intranet.alxswe.com/concepts")
      ? "ALX"
      : "External",
    project: conceptPageName,
  };

  const serverRes = await postRequest("/api/v1/resource", reqData);

  console.log(serverRes, "serverRes");
};

async function queueTasksSequentially(links, cookies, cluster) {
  for (let link of links) {
    await new Promise((resolve, reject) => {
      cluster.task(async ({ page, data: url }) => {
        try {
          const COOKIES = cookies;
          const { dirName, links: conceptLinks } = await scrapingConceptPage(
            page,
            url,
            COOKIES,
            "Foundation"
          );

          cluster.task(async ({ page, data: url }) => {
            await scrapingConceptPageResources(page, url, COOKIES, dirName);
          });

          for (let link of conceptLinks) {
            // add project's concept links to queue
            await cluster.queue(link);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // add project links to queue
      cluster.queue(link);
    });
  }
}

// queueTasksSequentially(foundationLinks)
//   .then(() => console.log("All tasks completed"))
//   .catch((err) => console.error("An error occurred:", err));

// utils
const foundationCurriculumScraping = async (cluster, page) => {
  await page.goto("https://intranet.alxswe.com/curriculums/1/observe", {
    timeout: 0,
  });

  let cookies = await page.cookies();
  console.log(cookies, "cookies saved");

  // links scraping
  await page.screenshot({ path: "foundation.png" });

  // Foundation part - Scrap each project link
  const foundationLinks = await getFoundationLinks(page);

  console.log(foundationLinks, "foundationLinks");

  const reqData = {
    name: "Foundation",
    links: foundationLinks,
  };

  const serverRes = await postRequest("/api/v1/curriculum", reqData);

  console.log(serverRes, "serverRes");

  // await queueTasksSequentially(foundationLinks, cookies, cluster);

  cluster.task(async ({ page, data: url }) => {
    const COOKIES = cookies;
    const {
      dirName,
      conceptPageName,
      links: conceptLinks,
    } = await scrapingConceptPage(page, url, COOKIES, "Foundation");

    if (conceptLinks) {
      cluster.task(async ({ page, data: url }) => {
        await scrapingConceptPageResources(
          page,
          url,
          COOKIES,
          dirName,
          conceptPageName
        );
      });

      for (let link of conceptLinks) {
        // add project's concept links to queue
        await cluster.queue(link);
      }
    }
  });

  for (let link of foundationLinks) {
    // add project links to queue
    await cluster.queue(link);
  }
};

const specialisationCurriculumScraping = async (cluster, page) => {
  // loop throught each type
  await page.goto("https://intranet.alxswe.com/curriculums/17/observe", {
    timeout: 0,
  });

  let cookies = await page.cookies();
  console.log(cookies, "cookies saved");

  // links scraping
  await page.screenshot({ path: "specialisation.png" });

  // Foundation part - Scrap each project link
  const specialisationLinks = await getSpecialisationsLinks(page);

  console.log(specialisationLinks, "specialisationLinks");

  const reqData = {
    name: "Specialisation",
    // status: true,
    links: specialisationLinks,
  };

  const serverRes = await postRequest("/api/v1/curriculum", reqData);

  console.log(serverRes, "serverRes");

  // await queueTasksSequentially(specialisationLinks, cookies, cluster);

  cluster.task(async ({ page, data: url }) => {
    const COOKIES = cookies;
    const {
      dirName,
      conceptPageName,
      links: conceptLinks,
    } = await scrapingConceptPage(page, url, COOKIES, "Specialisation");

    cluster.task(async ({ page, data: url }) => {
      await scrapingConceptPageResources(
        page,
        url,
        COOKIES,
        dirName,
        conceptPageName
      );
    });

    for (let link of conceptLinks) {
      // add project's concept links to queue
      await cluster.queue(link);
    }
  });

  for (let link of specialisationLinks) {
    // add project links to queue
    await cluster.queue(link);
  }
};
