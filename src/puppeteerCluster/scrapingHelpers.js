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
    const newCookies = await scrapData(foundationCurriculumScraping);

    const data = await getProjectsMetadata("Foundation");
    // console.log(data, "data");
    const cluster = await newCluster();

    if (data) {
      for (let project of data) {
        if (project.retryTimes > 4) {
          console.log(`Skip project ${project.name}, retry limit hits`);
          continue;
        }

        // Define the cluster task with the specific project data
        cluster.task(async ({ page, data: { url, project } }) => {
          let target = "";
          page.setCookie(...newCookies);

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

        // Wait for the cluster to process the tasks before closing
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
        if (project.retryTimes > 4) {
          console.log(`Skip project ${project.name}, retry limit hits`);
          continue;
        }

        // Define the cluster task with the specific project data
        cluster.task(async ({ page, data: { url, project } }) => {
          let target = "";
          page.setCookie(...newCookies);

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

        // Wait for the cluster to process the tasks before closing
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
        if (items.retryTimes > 4) {
          console.log(`Skip project ${project.name}, retry limit hits`);
          continue;
        }

        cluster.task(async ({ page, data: { url, items } }) => {
          let target = "";

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
              return cluster.queue(url);
            } else {
              console.error("Task failed:", error);

              target = "error";
            }
          } finally {
            console.log("Ressources data posted to server");

            // mark Curriculum as fully scraped
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
      }
      // Wait for the cluster to process the tasks before closing
      await cluster.idle();
      await cluster.close();
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
