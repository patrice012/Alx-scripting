async function processLinksSequentially(links, browser, cookies) {
    for (const link of links) {
        await (async () => {
            /* PROJECT LINKS */
            const projectBW = await browser.createIncognitoBrowserContext();
            const projectPage = await projectBW.newPage();
            await projectPage.setCookie(...cookies);
            await projectPage.goto(link, { timeout: 0 });

            // format PDF name based on project name
            await projectPage.waitForSelector('h1[class="gap"]');

            const pdfName = await getPdfName(projectPage);

            await removeUnwantedTags(projectPage);

            await createPDF(projectPage, pdfName);

            // close browser window
            await projectBW.close();
        })();

        // Introduce a delay between iterations
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

// create PDF based on HTML content
async function createPDF(projectPage, pdfName) {
    await projectPage.pdf({
        path: pdfName,
        printBackground: true,
        format: "A4",
    });
}

async function removeUnwantedTags(projectPage) {
    try {
        // disable unwanted elements
        await projectPage.$eval(
            'div[class="hidden-xs navigation sidebar"]',
            (sidebar) => {
                sidebar.style.display = "None";
            }
        );
        await projectPage.$eval('button[id="search-button"]', (searchBtn) => {
            searchBtn.style.display = "None";
        });
        await projectPage.$eval('iframe[id="launcher"]', (helpBtn) => {
            helpBtn.style.display = "None";
        });
    } catch (error) {
        /* handle error */
    }
}

async function getPdfName(projectPage) {
    return await projectPage.$eval('h1[class="gap"]', (h1) => {
        const textContent = h1.innerText
            .replaceAll(" ", "-")
            .replaceAll(".", "")
            .replaceAll(",", "")
            .trim();
        return textContent + ".pdf";
    });
}

module.exports = processLinksSequentially;
