const puppeteer = require("puppeteer");
const { BASE_URL, EMAIL, PASSWORD } = require("./config");

const delay = { delay: 500 };
const clickOption = { button: "middle", delay: 500 };
// Grab the cookies from the page used to log in
let cookies = "";
// let cookies = await page.cookies();
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    const url = new URL(BASE_URL);
    await page.goto(url, { waitUntil: "networkidle0" });

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
            await pwdInput.type([PASSWORD, delay]);
            /* check the remeneber me box */
            const rmb_me = await page.$('input[id="user_remember_me"]');
            await rmb_me.click(clickOption);
            /* login btn click*/
            const loginBtn = await page.$('input[value="Log in"]');
            await loginBtn.click(clickOption);
            /* wait  for a request to finish */
            await page.waitForNavigation();
        }
    } catch (error) {
        console.log(error);
    } finally {
        // Grab the cookies from the page used to log in
        cookies = await page.cookies();
    }
    
    // OPEN MODAL OVERVIEW
    // await page.waitForSelector('a[data-target="#period_scores_modal_1"]');
    const modalBox = await page.$('a[data-target="#period_scores_modal_1"]');
    await modalBox.click(clickOption);
    // GET ALL LINKS
    const tableLinks = await page.$('table[class="table"]');
    const links = await tableLinks.$$("a");
    console.log(links);
    // Array.array.forEach(element => {

    // });
})();
