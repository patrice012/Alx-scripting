const { Cluster } = require("puppeteer-cluster");
const { BASE_URL, broswerView } = require("../../config");
const loginProcess = require("../auth/auth");
const debug = require("../../utils/debug");
const { loadCookies, saveCookies } = require("../../utils/cookies");
const createPDF = require("../../utils/createPDF");
const { createDir, writeToFile } = require("../../utils/files");
const removeUnwantedTags = require("../../utils/removeTags");
const { getPdfName } = require("../../utils/formatPDFName");

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 6,
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

      if (Object.keys(state.cookies).length === 0 || state.cookies === "") {
        // go to login page
        await page.goto(url, { timeout: 0 });

        // login
        await loginProcess(page);

        // get cookies
        let cookies = await page.cookies();
        state.cookies = cookies;

        // save for the next time
         saveCookies(cookies);
      } else {
        await page.setCookie(...state.cookies);
        await page.goto(url, { timeout: 0 });
      }
    } catch (error) {
      state.error = error;
      console.log(error, "error");
    }

    console.log(state.cookies, "cookies fro two");

    if (!state.error) {
      await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
        visible: true,
      });
      const modalBox = await page.$('a[data-target="#period_scores_modal_1"]');
      await modalBox.click();

      const links = await page.$$eval('table[class="table"] a', (links) =>
        links.map((link) => link.href)
      );

      await page.screenshot({ path: "home.png" });

      state.links = links;
      analytics.totalLinks.push(links);
      console.log(state.links, "state.links");

      // Scrap each project link
      cluster.task(async ({ page, data: url }) => {
        // set pages cookies
        await page.setCookie(...state.cookies);

        // navigate to project page
        await page.goto(url, { timeout: 0 });

        // format PDF name based on project name
        const pdfName = await getPdfName(page, 'h1[class="gap"]');

        // remove unwanted tags
        await removeUnwantedTags(page);

        /* create directory for the project */
        let dirName = `Project-${pdfName}-dir`;
        await createDir(dirName);

        // create pdf name
        let dirPath = `pdf/${dirName}/${pdfName}`;
        await createPDF(page, dirPath);

        // Scrap all links in the project's concept page
        /* get all links */
        await page.waitForSelector('div[class="panel panel-default"]');
        const links = await page.$$eval(
          'div[class="panel panel-default"] a',
          (links) => links.map((link) => link.href)
        );

        // save concept links
        state.conceptLinks = links;
        analytics.totalConceptLinks.push(links);
        console.log(state.conceptLinks, "state.conceptLinks");

        cluster.task(async ({ page, data: url }) => {
          // set pages cookies
          await page.setCookie(...state.cookies);

          // navigate to project page
          await page.goto(url, { timeout: 0, waitUntil: "networkidle2" });

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

          let pdfPath = `pdf/${dirName}/${pdfName}`;
          /* Check if it's an amazon assets */
          // let siteUrl = await page.evaluate(() => window.location.href);
          await createPDF(page, pdfPath);
        });

        for (let link of state.conceptLinks) {
          // add project's concept links to queue
          await cluster.queue(link);
        }
      });

      for (let link of state.links.slice(9, 11)) {
        // add project links to queue
        await cluster.queue(link);
      }
      // save analytics data
      writeToFile(JSON.stringify(analytics));
    }
  });

  await cluster.idle();
  await cluster.close();
})();
