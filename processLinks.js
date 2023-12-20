async function processLinksSequentially(links, browser, cookies) {
    // for (const link of links) {
    await (async () => {
        /* PROJECT LINKS */
        let link = links[0];
        const projectBW = await browser.createIncognitoBrowserContext();
        const projectPage = await projectBW.newPage();
        await projectPage.setCookie(...cookies);
        await projectPage.goto(link, { timeout: 0 });

        // format PDF name based on project name
        await projectPage.waitForSelector('h1[class="gap"]');

        const pdfName = await projectPage.$eval('h1[class="gap"]', (h1) => {
            const textContent = h1.innerText
                .replaceAll(" ", "-")
                .replaceAll(".", "")
                .replaceAll(",", "")
                .trim();
            return textContent + ".pdf";
        });

        // create PDF based on HTML content
        await projectPage.pdf({
            path: pdfName,
            // format: "A4",
            // fullPage: true,
        });
        // close browser window
        await projectBW.close();
    })();

    // Introduce a delay between iterations
    await new Promise((resolve) => setTimeout(resolve, 30000));
    // }
}

module.exports = processLinksSequentially;
