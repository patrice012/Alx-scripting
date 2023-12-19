const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    const url = new URL(
        "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal"
    );
    await page.goto(url, { waitUntil: "networkidle0" });
    const inputBox = await page.$("input[id='searchInput']");
    await inputBox.type("Javascript", { delay: 500 });
    await inputBox.press("Enter");
    await page.waitForNavigation();
    await page.screenshot({ path: "wiki.png", fullPage: true });
    //To reflect CSS used for screens instead of print
    await page.emulateMediaType("screen");
    await page.pdf({ path: "wiki.pdf", format: "A4" });
    await browser.close();
})();
