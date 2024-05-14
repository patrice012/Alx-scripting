const { getFoundationLinks } = require("./helpers");
const { scrapingConceptPage } = require("./script");
const postRequest = require("../../utils/postReq");

// utils
const foundationCurriculumScraping = async (cluster, page) => {
  await page.goto("https://intranet.alxswe.com/curriculums/1/observe", {
    timeout: 0,
  });

  let cookies = await page.cookies();
  // links scraping
  await page.screenshot({ path: "foundation.png" });

  // Foundation part - Scrap each project link
  const { foundationLinks, names } = await getFoundationLinks(page);

  const reqData = {
    name: "Foundation",
    links: foundationLinks,
  };

  const serverRes = await postRequest("/api/v1/curriculum", reqData);
  console.log("Curriculum data posted to server");

  cluster.task(async ({ page, data: url }) => {
    try {
      const COOKIES = cookies;
      await scrapingConceptPage(page, url, COOKIES, "Foundation");
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.error("Navigation timed out, retrying...");
        return cluster.queue(url);
      } else {
        console.error("Task failed:", error);
      }
    }
  });

  for (let link of foundationLinks) {
    // add project links to queue
    await cluster.queue(link);
  }
  return cookies;
};

module.exports = foundationCurriculumScraping;
