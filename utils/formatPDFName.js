async function getPdfName(page, target) {
  // await page.waitForSelector(target);
  let fileName = "";
  try {
    fileName = await page.$eval(target, (ele) => {
      let name = ele.innerText
        .trim()
        .replace(/[\\'.,\/\s]+/g, "-")
        .replace(/-+/g, "-")
        .split("-")
        .slice(0, 8)
        .join("-")
        .replace(/[\\'.,\/\s]+/g, "-");
      if (!name.length >= 1) {
        name = window.document.title;
      }
      return name + ".pdf";
    });
  } catch (e) {
    console.log(e);
    fileName = "default-name.pdf";
  }
  return fileName;
}

function _format(text) {
  return text
    .trim()
    .replace(/[\\'.,\/\s]+/g, "-")
    .replace(/-+/g, "-")
    .split("-")
    .slice(0, 8)
    .join("-")
    .replace(/[\\'.,\/\s]+/g, "-");
}

module.exports = { getPdfName, _format };
