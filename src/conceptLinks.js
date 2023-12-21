const loginProcess = require("./auth");
const createPDF = require("../utils/createPDF");
const removeUnwantedTags = require("../utils/removeTags");
const { getPdfName } = require("../utils/formatPDFName");

async function openConceptLinks(projectPage, browser, dirName) {
    /* get all links */
    await projectPage.waitForSelector('div[class="panel panel-default"]');

    const links = await projectPage.$$('div[class="panel panel-default"] a');
    let hrefs = [];
    for (let link of links) {
        const href = (await link.getProperty("href")).jsonValue();
        hrefs.push(href);
    }

    const projectLinks = await getAllResolvedURLs(hrefs);
    /* open each link */
    for (const link of projectLinks) {
        if (!link.includes("https://s3.amazonaws.com/")) {
            await (async () => {
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
                    const target =
                        'h1[class="d-flex flex-column gap-2"] > span';
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
        }

        // Introduce a delay between iterations
        // await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

async function getAllResolvedURLs(promiseArray) {
    try {
        // Wait for all promises to resolve
        const resolvedURLs = await Promise.all(promiseArray);

        // Filter out empty strings or any other unwanted values
        const validURLs = resolvedURLs.filter(
            (url) => url && typeof url === "string"
        );

        return validURLs;
    } catch (error) {
        console.error("Error getting resolved URLs:", error);
        return [];
    }
}

module.exports = openConceptLinks;
