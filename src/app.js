// env variable
const { BASE_URL, broswerView } = require("../config");
// puppeteer
const puppeteer = require("puppeteer");
// helper functions
const processLinksSequentially = require("./processLinks");
const loginProcess = require("./auth");
// utils
const { _format } = require("../utils/formatPDFName");
const debug = require("../utils/debug");
const { loadCookies, saveCookies } = require("../utils/cookies");

const startJob = async () => {
  const browser = await puppeteer.launch(broswerView);
  const url = new URL(BASE_URL);
  const page = await browser.newPage();

  // authentification process
  try {
    //get saved cookies
    const cookies = await loadCookies();

    console.log(cookies, "cookies");

    if (Object.keys(cookies).length === 0 || cookies === "") {
      await page.goto(url, { timeout: 0 });
      await loginProcess(page);
      await saveCookies(await page.cookies());
    } else {
      // use saved cookies
      await page.setCookie(...cookies);
      await page.goto(url, { timeout: 0 });
    }
  } catch (error) {
    console.log(error);
  }

  // open modal view
  await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
    visible: true,
  });
  const modalBox = await page.$('a[data-target="#period_scores_modal_1"]');
  await modalBox.click();

  // get all links in popup
  await page.waitForSelector('table[class="table"] a', {
    visible: true,
  });
  const links = await page.$$eval('table[class="table"] a', (links) =>
    links.map((link) => link.href)
  );

  try {
    /* expose custom function in DOM */
    await page.exposeFunction("_format", _format);
    /* process each links */
    await processLinksSequentially(links, browser);
  } catch (error) {
    console.log(error);
  }
  await browser.close();
};

startJob();

// const { Cluster } = require("puppeteer-cluster");

// (async () => {
//   // setup cluster
//   const cluster = await Cluster.launch({
//     concurrency: Cluster.CONCURRENCY_CONTEXT,
//     maxConcurrency: 2,
//     monitor: true,
//     puppeteerOptions: broswerView,
//   });

//   // base url
//   const url = new URL(BASE_URL);

//   // debug process
//   debug(cluster);

//   // create new page
//   await cluster.task(async ({ page, data: url }) => {
//     await page.goto(url, { timeout: 0 });
//     // task here

//     // AUTHENTICATION PROCESS
//     try {
//       await loginProcess(page);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       // Grab the cookies from the page used to log in
//       cookies = await page.cookies();
//     }

//     // open modal view
//     await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
//       visible: true,
//     });
//     const modalBox = await page.$('a[data-target="#period_scores_modal_1"]');
//     await modalBox.click();

//     // get all links in popup
//     await page.waitForSelector('table[class="table"] a', {
//       visible: true,
//     });
//     const links = await page.$$eval('table[class="table"] a', (links) =>
//       links.map((link) => link.href)
//     );

//     try {
//       /* expose custom function in DOM */
//       await page.exposeFunction("_format", _format);
//       /* process each links */
//       //   await processLinksSequentially(links, browser, cookies);
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   cluster.queue(url);
//   // many more pages

//   await cluster.idle();
//   await cluster.close();
// })();
