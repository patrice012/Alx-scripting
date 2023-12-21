const puppeteer = require("puppeteer");
const processLinksSequentially = require("./processLinks");
const loginProcess = require("./auth");
const { BASE_URL, broswerView } = require("../config");
const { _format } = require("../utils/formatPDFName");

// Grab the cookies from the page used to log in
let cookies = "";
(async () => {
    const browser = await puppeteer.launch(broswerView);
    const url = new URL(BASE_URL);
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });

    // AUTHENTICATION PROCESS
    try {
        await loginProcess(page);
    } catch (error) {
        /* HANDLE ERROR HERE */
        console.log(error);
    } finally {
        // Grab the cookies from the page used to log in
        cookies = await page.cookies();
    }

    // OPEN MODAL OVERVIEW
    await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
        visible: true,
    });
    const modalBox = await page.$('a[data-target="#period_scores_modal_1"]');
    await modalBox.click();

    // GET ALL LINKS IN POPUP
    await page.waitForSelector('table[class="table"] a', {
        visible: true,
    });
    const links = await page.$$eval('table[class="table"] a', (links) =>
        links.map((link) => link.href)
    );

    try {
        /* EXPOSE CUSTOM FUNCTION IN THE DOM */
        await page.exposeFunction("_format", _format);
        /* process each links */
        await processLinksSequentially(links, browser, cookies);
    } catch (error) {
        console.log(error);
    }
    await browser.close();
})();
