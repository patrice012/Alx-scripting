const { getSpecialisationsLinks } = require("./helpers");
const { scrapingConceptPage } = require("./script");
const postRequest = require("../../utils/postReq");

const specialisationCurriculumScraping = async (cluster, page) => {
  // loop throught each type
  await page.goto("https://intranet.alxswe.com/curriculums/17/observe", {
    timeout: 0,
  });

  let cookies = await page.cookies();
  // links scraping
  await page.screenshot({ path: "specialisation.png" });

  // Foundation part - Scrap each project link
  const { specialisationLinks, names } = await getSpecialisationsLinks(page);

  const reqData = {
    name: "Specialisation",
    links: specialisationLinks,
  };

  const serverRes = await postRequest("/api/v1/curriculum", reqData);
  console.log("Curiiculum data posted to server");

  cluster.task(async ({ page, data: url }) => {
    try {
      const COOKIES = cookies;
      await scrapingConceptPage(page, url, COOKIES, "Specialisation");
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.error("Navigation timed out, retrying...");
        return cluster.queue(url);
      } else {
        console.error("Task failed:", error);
      }
    }
  });

  for (let link of specialisationLinks) {
    // add project links to queue
    await cluster.queue(link);
  }
  return cookies;
};

module.exports = specialisationCurriculumScraping;
