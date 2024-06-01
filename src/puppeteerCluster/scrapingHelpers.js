const { scrapData } = require("./index");
const foundationCurriculumScraping = require("./fondationScript");
const specialisationCurriculumScraping = require("./specialisationScript");
const getProjectsMetadata = require("./getProjectLinks");
const getResoursesMetadata = require("./getResourcesLinks");
const { scrapingConceptPageResources } = require("./script");
const newCluster = require("./newCluster");
const { PDF_ROUTE } = require("../../config");
const postRequest = require("../../utils/postReq");

const foundationScrapingHelper = async () => {
  try {
    // const newCookies = await scrapData(foundationCurriculumScraping);

    const data = await getProjectsMetadata("Foundation");
    // console.log(data, "data");
    const cluster = await newCluster({ maxConcurrency: 6 });

    if (data) {
      for (let project of data) {
        try {
          if (project.retryTimes > 4) {
            console.log(`Skip project ${project.name}, retry limit hits`);
            continue;
          }

          // Define the cluster task with the specific project data
          cluster.task(async ({ page, data: { url, project } }) => {
            let target = "";

            // timeout configuration
            await page.setDefaultTimeout(150000); // 2min 30s
            await page.setDefaultNavigationTimeout(60000); // 1min

            // set cookies
            // await page.setCookie(...newCookies);

            try {
              await scrapingConceptPageResources(
                page,
                url,
                project.dirName,
                project.conceptPageName
              );

              target = "success";
            } catch (error) {
              if (error.name === "TimeoutError") {
                console.error("Navigation timed out, retrying...");

                target = "retrying";
                return cluster.queue({ url, project });
              } else {
                console.error("Task failed:", error);

                target = "error";
              }
            } finally {
              console.log("Projects data posted to server");

              const successReqData = {
                id: project._id,
                target: target,
                url: url,
              };

              const reqRes = await postRequest(
                "/api/v1/project/update",
                successReqData
              );
              console.log("Updating Project status", successReqData);
            }
          });

          if (project.resources.length < 1) continue;
          // Queue the project resources with the specific project data
          for (let link of project.resources) {
            await cluster.queue({ url: link, project });
          }
        } catch (error) {
          console.log(`Error processing project ${project.name}:`, error);
        }
      }

      console.log("Project scraping finished");

      // Wait for the cluster to process the tasks before closing
      await cluster.idle();
      await cluster.close();
    }
  } catch (error) {
    console.log("Error in foundationScrapingHelper:", error);
    throw error;
  }
};

const specialisationScrapingHelper = async () => {
  try {
    const newCookies = await scrapData(specialisationCurriculumScraping);
    const data = await getProjectsMetadata("Specialisation");
    const cluster = await newCluster({ maxConcurrency: 6 });

    if (data) {
      for (let project of data) {
        try {
          if (project.retryTimes > 4) {
            console.log(`Skip project ${project.name}, retry limit hits`);
            continue;
          }

          // Define the cluster task with the specific project data
          cluster.task(async ({ page, data: { url, project } }) => {
            let target = "";

            // timeout configuration
            await page.setDefaultTimeout(150000); // 2min 30s
            await page.setDefaultNavigationTimeout(60000); // 1min

            // set cookies
            await page.setCookie(...newCookies);

            try {
              await scrapingConceptPageResources(
                page,
                url,
                project.dirName,
                project.conceptPageName
              );

              target = "success";
            } catch (error) {
              if (error.name === "TimeoutError") {
                console.error("Navigation timed out, retrying...");

                target = "retrying";
                return cluster.queue({ url, project });
              } else {
                console.error("Task failed:", error);

                target = "error";
              }
            } finally {
              console.log("Projects data posted to server");

              const successReqData = {
                id: project._id,
                target: target,
                url: url,
              };

              const reqRes = await postRequest(
                "/api/v1/project/update",
                successReqData
              );
              console.log("Updating Project status", successReqData);
            }
          });

          if (project.resources.length < 1) continue;
          // Queue the project resources with the specific project data
          for (let link of project.resources) {
            await cluster.queue({ url: link, project });
          }
        } catch (error) {
          console.log(`Error processing project ${project.name}:`, error);
        }
      }

      console.log("Project scraping finished");
      // Wait for the cluster to process the tasks before closing
      await cluster.idle();
      await cluster.close();
    }
  } catch (error) {
    console.log("Error in specialisationScrapingHelper:", error);
    throw error;
  }
};

const scrapingResourcesHelper = async () => {
  try {
    const cluster = await newCluster({ maxConcurrency: 6 });
    const resData = await getResoursesMetadata({ projectType: "ALX" });

    if (resData) {
      for (let items of resData) {
        try {
          if (items.retryTimes > 4) {
            console.log(`Skip project ${items.project}, retry limit hits`);
            continue;
          }

          cluster.task(async ({ page, data: { url, items } }) => {
            let target = "";

            // timeout configuration
            await page.setDefaultTimeout(150000); // 2min 30s
            await page.setDefaultNavigationTimeout(60000); // 1min

            try {
              await scrapingConceptPageResources(
                page,
                url,
                `${PDF_ROUTE}/resources/${items.project}`,
                items.project
              );

              target = "success";
            } catch (error) {
              if (error.name === "TimeoutError") {
                console.error("Navigation timed out, retrying...");

                target = "retrying";
                return cluster.queue({ url, items });
              } else {
                console.error("Task failed:", error);

                target = "error";
              }
            } finally {
              console.log("Resources data posted to server");

              const successReqData = {
                id: items._id,
                target: target,
                url: url,
              };

              const reqRes = await postRequest(
                "/api/v1/resource/update",
                successReqData
              );
              console.log("Updating Resources status", reqRes);
            }
          });

          if (items?.relatedLinks.length < 1) continue;

          for (let link of items.relatedLinks) {
            console.log(link, "link");

            await cluster.queue({ url: link, items });
          }
        } catch (error) {
          console.log(`Error processing items ${items.project}:`, error);
        }
      }

      console.log("Ressource scraping finished");
      // Wait for the cluster to process the tasks before closing
      await cluster.idle();
      await cluster.close();
    }
  } catch (error) {
    console.log("Error in scrapingResourcesHelper:", error);
    throw error;
  }
};

module.exports = {
  foundationScrapingHelper,
  specialisationScrapingHelper,
  scrapingResourcesHelper,
};
