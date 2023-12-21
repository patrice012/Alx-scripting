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
        await page.exposeFunction("_format", _format);await (async () => {
            /* PROJECT LINKS */

            const conceptPage = await browser.newPage();
            await conceptPage.goto(link, {
                timeout: 0,
                waitUntil: "networkidle2",
            });

            try {
                await loginProcess(conceptPage);
            } catch (error) {
                console.log(error);
                await conceptPage.waitForNavigation({
                    waitFor: "networkidle2",
                });
            }

            // format PDF name based on project name
            let pdfName = "";
            if (link.includes("https://intranet.alxswe.com/concepts")) {
                const target = 'h1[class="d-flex flex-column gap-2"] > span';
                pdfName = await getPdfName(conceptPage, target);
                console.log(pdfName, "pdfName from concept page");
                await removeUnwantedTags(conceptPage);
            } else {
                /* Use the document title as pdf name */
                pdfName = await conceptPage.evaluate(() => {
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
                console.log(pdfName, "pdfName from document title");
            }
            let pdfPath = `pdf/${dirName}/${pdfName}`;
            await createPDF(conceptPage, pdfPath);

            // close page window
            await conceptPage.close();
        })();
        /* process each links */
        await processLinksSequentially(links, browser, cookies);
    } catch (error) {
        console.log(error);
    }
    await browser.close();
})();
