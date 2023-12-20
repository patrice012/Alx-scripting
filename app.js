const puppeteer = require("puppeteer");
const { BASE_URL, EMAIL, PASSWORD } = require("./config");

const delay = { delay: 200 };
const clickOption = { button: "middle", delay: 500 };
// Grab the cookies from the page used to log in
let cookies = "";
// let cookies = await page.cookies();
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const url = new URL(BASE_URL);
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });

    // AUTHENTICATION PROCESS
    try {
        /* check if the login page is show up */
        const loginBox = await page.$('div[class="logged_out_form"]');
        if (loginBox) {
            /* LOGIN PROCESS */
            /* fill email form */
            const emailInput = await page.$('input[id="user_email"]');
            await emailInput.type(EMAIL, delay);
            /* fill password */
            const pwdInput = await page.$('input[id="user_password"]');
            await pwdInput.type(PASSWORD, delay);
            /* check the remeneber me box */
            const rmb_me = await page.$('input[id="user_remember_me"]');
            await rmb_me.click();
            /* login btn click*/
            const loginBtn = await page.$('input[type="submit"]');
            await Promise.all([
                loginBtn.click(),
                page.waitForNavigation({ waitFor: "networkidle0" }),
            ]);
        }
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
    console.log(links);

    try {
        links.forEach((link) => {
            (async () => {
                /* PROJECT LINKS*/
                // Create a fresh non-persistent browser context
                const projectBW = await browser.createIncognitoBrowserContext();
                const projectPage = await projectBW.newPage();
                await projectPage.setCookie(...cookies);
                await projectPage.goto(link, { timeout: 0 });
            })();
        });
    } catch (error) {
        console.log(error);
    }
})();
