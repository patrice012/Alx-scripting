const { scrapData } = require("./index");
const foundationCurriculumScraping = require("./fondationScript");
const specialisationCurriculumScraping = require("./specialisationScript");
const getProjectsMetadata = require("./getProjectLinks");
const getResoursesMetadata = require("./getResourcesLinks");
const { scrapingConceptPageResources } = require("./script");
const newCluster = require("./newCluster");
const { PDF_ROUTE } = require("../../config");

const foundationScrapingHelper = async () => {
  try {
    const newCookies = await scrapData(foundationCurriculumScraping);
    const data = await getProjectsMetadata("Foundation");
    // console.log(data, "data");
    const cluster = await newCluster();

    if (data) {
      for (let project of data) {
        cluster.task(async ({ page, data: url }) => {
          page.setCookie(...newCookies);
          try {
            await scrapingConceptPageResources(
              page,
              url,
              project.dirName,
              project.conceptPageName
            );
          } catch (error) {
            if (error.name === "TimeoutError") {
              console.error("Navigation timed out, retrying...");
              return cluster.queue(url);
            } else {
              console.error("Task failed:", error);
            }
          }
        });
        for (let link of project.resources) {
          // add project links to queue
          await cluster.queue(link);
        }
        await cluster.idle();
        await cluster.close();
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const specialisationScrapingHelper = async () => {
  try {
    const newCookies = await scrapData(specialisationCurriculumScraping);
    const data = await getProjectsMetadata("Specialisation");
    const cluster = await newCluster();

    if (data) {
      for (let project of data) {
        cluster.task(async ({ page, data: url }) => {
          page.setCookie(...newCookies);
          try {
            await scrapingConceptPageResources(
              page,
              url,
              project.dirName,
              project.conceptPageName
            );
          } catch (error) {
            if (error.name === "TimeoutError") {
              console.error("Navigation timed out, retrying...");
              return cluster.queue(url);
            } else {
              console.error("Task failed:", error);
            }
          }
        });
        for (let link of project.resources) {
          // add project links to queue
          await cluster.queue(link);
        }
        await cluster.idle();
        await cluster.close();
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const scrapingResourcesHelper = async () => {
  try {
    // console.log("Adding resources scraping helper");

    const cluster = await newCluster();
    const resData = await getResoursesMetadata({ projectType: "ALX" });
    // console.log(resData, "resData");
    if (resData) {
      for (let items of resData) {
        cluster.task(async ({ page, data: url }) => {
          try {
            await scrapingConceptPageResources(
              page,
              url,
              `${PDF_ROUTE}/resources/${items.project}`,
              items.project
            );
          } catch (error) {
            if (error.name === "TimeoutError") {
              console.error("Navigation timed out, retrying...");
              return cluster.queue(url);
            } else {
              console.error("Task failed:", error);
            }
          }
        });
        if (items?.relatedLinks.length < 1) continue;

        for (let link of items.relatedLinks) {
          console.log(link, "link");

          await cluster.queue(link);
        }
      }
      await cluster.idle(); // Wait for all tasks to complete
      await cluster.close(); // Close the cluster after all tasks are done
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  foundationScrapingHelper,
  specialisationScrapingHelper,
  scrapingResourcesHelper,
};
