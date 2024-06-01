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
    let data = await getProjectsMetadata("Foundation");

    const helper = async (data, newCookies = {}) => {
      if (!!data.length) {
        const cluster = await newCluster({ maxConcurrency: 6 });

        for (let project of data) {
          try {
            if (project.retryTimes > 4) {
              console.log(`--> Skip project ${project.name}, retry limit hits`);
              continue;
            }

            // Define the cluster task with the specific project data
            cluster.task(async ({ page, data: { url, project } }) => {
              let target = "";

              // timeout configuration
              await page.setDefaultTimeout(150000); // 2min 30s
              await page.setDefaultNavigationTimeout(150000);

              // set cookies
              if (Object.keys(newCookies).length) {
                await page.setCookie(...newCookies);
              }

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
                  console.error("--> Navigation timed out, retrying...");

                  target = "retrying";
                  return cluster.queue({ url, project });
                } else {
                  console.error("--> Task failed:", error);

                  target = "error";
                }
              } finally {
                console.log("--> Projects data posted to server");

                const successReqData = {
                  id: project._id,
                  target: target,
                  url: url,
                };

                const reqRes = await postRequest(
                  "/api/v1/project/update",
                  successReqData
                );
                console.log("--> Updating Project status", successReqData);
              }
            });

            let urls =
              project?.resources && project?.resources?.length > 0
                ? project?.resources
                : project?.errorUrls && project?.errorUrls?.length > 0
                ? project?.errorUrls
                : [];

            if (urls.length < 1) continue;
            // Queue the project resources with the specific project data
            for (let link of urls) {
              await cluster.queue({ url: link, project });
            }
          } catch (error) {
            console.log(
              `--> Error processing project ${project.conceptPageName}:`,
              error
            );
          }
        }

        console.log("--> Project scraping finished");

        // Wait for the cluster to process the tasks before closing
        await cluster.idle();
        await cluster.close();
      }
    };

    while (data.length) {
      await helper(data, newCookies);

      console.log("Redoing the same task");
      data = await getProjectsMetadata("Foundation");
    }
  } catch (error) {
    console.log("--> Error in foundationScrapingHelper:", error);
    throw error;
  }
};

const specialisationScrapingHelper = async () => {
  try {
    const newCookies = await scrapData(specialisationCurriculumScraping);
    let data = await getProjectsMetadata("Specialisation");

    const helper = async (data, newCookies = {}) => {
      if (!!data.length) {
        const cluster = await newCluster({ maxConcurrency: 6 });

        for (let project of data) {
          try {
            if (project.retryTimes > 4) {
              console.log(`--> Skip project ${project.name}, retry limit hits`);
              continue;
            }

            // Define the cluster task with the specific project data
            cluster.task(async ({ page, data: { url, project } }) => {
              let target = "";

              // timeout configuration
              await page.setDefaultTimeout(150000); // 2min 30s
              await page.setDefaultNavigationTimeout(150000);

              // set cookies
              if (Object.keys(newCookies).length) {
                await page.setCookie(...newCookies);
              }

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
                  console.error("--> Navigation timed out, retrying...");

                  target = "retrying";
                  return cluster.queue({ url, project });
                } else {
                  console.error("--> Task failed:", error);

                  target = "error";
                }
              } finally {
                console.log("--> Projects data posted to server");

                const successReqData = {
                  id: project._id,
                  target: target,
                  url: url,
                };

                const reqRes = await postRequest(
                  "/api/v1/project/update",
                  successReqData
                );
                console.log("--> Updating Project status", successReqData);
              }
            });

            let urls =
              project?.resources && project?.resources?.length > 0
                ? project?.resources
                : project?.errorUrls && project?.errorUrls?.length > 0
                ? project?.errorUrls
                : [];

            if (urls.length < 1) continue;
            // Queue the project resources with the specific project data
            for (let link of urls) {
              await cluster.queue({ url: link, project });
            }
          } catch (error) {
            console.log(
              `--> Error processing project ${project.conceptPageName}:`,
              error
            );
          }
        }

        console.log("--> Project scraping finished");

        // Wait for the cluster to process the tasks before closing
        await cluster.idle();
        await cluster.close();
      }
    };

    while (data.length) {
      await helper(data, newCookies);

      console.log("Redoing the same task");
      data = await getProjectsMetadata("Foundation");
    }
  } catch (error) {
    console.log("--> Error in specialisationScrapingHelper:", error);
    throw error;
  }
};

const scrapingResourcesHelper = async () => {
  try {
    let resData = await getResoursesMetadata({ projectType: "ALX" });

    const helper = async (resData) => {
      if (!!resData.length) {
        const cluster = await newCluster({ maxConcurrency: 6 });

        for (let items of resData) {
          try {
            if (items.retryTimes > 4) {
              console.log(
                `--> Skip project ${items.project}, retry limit hits`
              );
              continue;
            }

            cluster.task(async ({ page, data: { url, items } }) => {
              let target = "";

              // timeout configuration
              await page.setDefaultTimeout(150000); // 2min 30s
              await page.setDefaultNavigationTimeout(150000);

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
                  console.error("--> Navigation timed out, retrying...");

                  target = "retrying";
                  return cluster.queue({ url, items });
                } else {
                  console.error("--> Task failed:", error);

                  target = "error";
                }
              } finally {
                console.log("--> Resources data posted to server");

                const successReqData = {
                  id: items._id,
                  target: target,
                  url: url,
                };

                const reqRes = await postRequest(
                  "/api/v1/resource/update",
                  successReqData
                );
                console.log("--> Updating Resources status", reqRes);
              }
            });

            let urls =
              items?.relatedLinks && items?.relatedLinks?.length > 0
                ? items?.relatedLinks
                : items?.errorUrls && items?.errorUrls?.length > 0
                ? items?.errorUrls
                : [];

            if (urls.length < 1) continue;

            for (let link of urls) {
              console.log(link, "link");

              await cluster.queue({ url: link, items });
            }
          } catch (error) {
            console.log(`--> Error processing items ${items.project}:`, error);
          }
        }

        console.log("--> Ressource scraping finished");
        // Wait for the cluster to process the tasks before closing
        await cluster.idle();
        await cluster.close();
      }
    };

    while (resData.length) {
      await helper(resData);

      console.log("Redoing the same task");
      resData = await getResoursesMetadata({ projectType: "ALX" });
    }
  } catch (error) {
    console.log("--> Error in scrapingResourcesHelper:", error);
    throw error;
  }
};

module.exports = {
  foundationScrapingHelper,
  specialisationScrapingHelper,
  scrapingResourcesHelper,
};
