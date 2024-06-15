const { getConceptLinks } = require("./helpers");
const postRequest = require("../utils/postReq");
const { PDF_ROUTE } = require("../config");
const { scrapingConceptPageResources } = require("./script");
const { _format } = require("../utils/formatPDFName");

// // utils

const conceptPageScraping = async (cluster, page) => {
  // timeout configuration
  await page.setDefaultTimeout(150000); // 2min 30s
  await page.setDefaultNavigationTimeout(150000);
  let links = ["https://intranet.alxswe.com/concepts"];

  // Define the cluster task outside of the processUrl function
  cluster.task(async ({ page, data: { url, name } }) => {
    // timeout configuration
    await page.setDefaultTimeout(150000); // 2min 30s
    await page.setDefaultNavigationTimeout(150000);

    try {
      const id = Math.floor(Math.random() * 101);
      await scrapingConceptPageResources(
        page,
        url,
        `${PDF_ROUTE}/concepts/${_format(name)}-${id}`,
        name
      );
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.error("Navigation timed out, retrying...");
        return cluster.queue({ url, name });
      } else {
        console.error("Task failed:", error);
      }
    }
  });

  // Function to process each URL
  const processUrl = async (url) => {
    console.log(`Processing: ${url}`);

    await page.goto(url, {
      waitUntil: "load",
    });

    const linkObjects = await getConceptLinks(page);
    // console.log(linkObjects, "linkObjects");

    const conceptLinks = linkObjects.map((link) => link.href);

    const reqData = {
      name: "Concept",
      links: conceptLinks,
    };

    const serverRes = await postRequest("/api/v1/concept", reqData);
    console.log("Concept data posted to server");

    for (let link of linkObjects) {
      // add project links to queue
      await cluster.queue({ url: link.href, name: link.name });
    }

    // get paginations
    const urls = await page.$eval(".pagination", (pagBox) => {
      const links = Array.from(pagBox.querySelectorAll(".current ~ a"));
      let conceptLinks = links
        .filter((link) => link.href && link.href.trim() !== "")
        .map((link) => link.href);
      return [...new Set(conceptLinks)];
    });

    // Sort the array by page number
    urls.sort((a, b) => {
      const pageA = parseInt(a.match(/page=(\d+)/)[1]);
      const pageB = parseInt(b.match(/page=(\d+)/)[1]);
      return pageA - pageB;
    });

    return urls[0] ? await processUrl(urls[0]) : null;
  };

  await processUrl(links[0]);

  console.log("Concept data posted to server");

  // mark Curriculum as fully scraped
  const successReqData = {
    name: "Concept",
    target: "success",
  };

  const reqRes = await postRequest("/api/v1/concept/update", successReqData);
  console.log("Updating Concept status");
  return cluster;
};

module.exports = conceptPageScraping;
