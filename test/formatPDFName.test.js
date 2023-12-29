const puppeteer = require("puppeteer");
const { getPdfName } = require("./formatPDFName");

describe("getPdfName", () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test("should wait for the target", async () => {
    await page.setContent('<div id="target">Test PDF Name</div>');
    const target = "#target";
    const pdfName = await getPdfName(page, target);
    expect(pdfName).toBe("Test-PDF-Name.pdf");
  });

  test("should format the name correctly", async () => {
    await page.setContent('<div id="target">Test, PDF. Name</div>');
    const target = "#target";
    const pdfName = await getPdfName(page, target);
    expect(pdfName).toBe("Test-PDF-Name.pdf");
  });

  test("should return default name if name length is less than 1", async () => {
    await page.setContent('<div id="target"></div>');
    const target = "#target";
    const pdfName = await getPdfName(page, target);
    expect(pdfName).toBe("default-name.pdf");
  });

  test("should limit the name to 55 characters", async () => {
    const longName = "a".repeat(60);
    await page.setContent(`<div id="target">${longName}</div>`);
    const target = "#target";
    const pdfName = await getPdfName(page, target);
    expect(pdfName.length).toBe(55 + 4); // 55 characters + '.pdf'
  });
});
