async function getPdfName(page, target) {
    await page.waitForSelector(target);
    return await page.$eval(target, (ele) => {
        let name = ele.innerText
            .trim()
            .slice(0, 55)
            .replace(/[\\'.,\/\s]+/g, "-")
            .replace(/-+/g, "-");
        if (!name.length >= 1) {
            name = "default-name";
        }
        return name + ".pdf";
    });
}

function _format(text) {
    return text
        .trim()
        .slice(0, 55)
        .replace(/[\\'.,\/\s]+/g, "-")
        .replace(/-+/g, "-");
}

module.exports = { getPdfName, _format };
