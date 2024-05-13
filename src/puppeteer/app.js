// env variable
const { BASE_URL, broswerView } = require("../../config");
// puppeteer
const puppeteer = require("puppeteer");
// helper functions
const processLinksSequentially = require("./processLinks");
const loginProcess = require("../auth/auth");
// utils
const { _format } = require("../../utils/formatPDFName");
const { loadCookies, saveCookies } = require("../../utils/cookies");

const startJob = async () => {
  const browser = await puppeteer.launch(broswerView);
  const url = new URL("https://intranet.alxswe.com/curriculums/1/observe");
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
      await saveCookies(await page.cookies());
    }
  } catch (error) {
    console.log(error);
  }
  // const cookies = await loadCookies();

  // open modal view
  await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
    visible: true,
  });
  const modalBox = await page.$('a[data-target="#period_scores_modal_1"]');
  await modalBox.click();


  // get fondation links
  const links = await page.$$eval('table[class="table"]', (table) => {
    let foundationTable = table[1];
    let links = Array.from(foundationTable.querySelectorAll("a"));
    return links.map((link) => link.href);
  });


  try {
    /* expose custom function in DOM */
    await page.exposeFunction("_format", _format);
    /* process each links */
    await processLinksSequentially(links, browser, "foundation");
  } catch (error) {
    console.log(error);
  }
  await browser.close();
};

startJob();
