const { getSpecialisationsLinks } = require("./helpers");
const { scrapingConceptPage } = require("./script");
const postRequest = require("../../utils/postReq");

const specialisationCurriculumScraping = async (cluster, page) => {
  // loop throught each type
  await page.goto("https://intranet.alxswe.com/curriculums/17/observe", {
    timeout: 0,
    waitUntil: "domcontentloaded",
  });

  let cookies = await page.cookies();
  // links scraping
  await page.screenshot({ path: "specialisation.png" });

  // Foundation part - Scrap each project link
  const { specialisationLinks, names } = await getSpecialisationsLinks(page);
  console.log(specialisationLinks, "specialisation links");

  const reqData = {
    name: "Specialisation",
    links: specialisationLinks,
  };

  const serverRes = await postRequest("/api/v1/curriculum", reqData);
  console.log("Curriculum data posted to server");

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

  console.log("Curriculum data posted to server");
  // mark Curriculum as fully scraped
  const successReqData = {
    name: "Specialisation",
    target: "success",
  };

  const reqRes = await postRequest("/api/v1/curriculum/update", successReqData);
  console.log("Updating curriculumn status");
  return cookies;
};

module.exports = specialisationCurriculumScraping;
