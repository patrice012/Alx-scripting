const Project = require("../db/project.model");

const getProjectsMetadata = async (projectType) => {
  try {
    // Find projects with status PENDING and select required fields
    const pendingProjects = await Project.find({
      curriculum: projectType,
      status: "PENDING",
    })
      .select({
        resources: 1,
        dirName: 1,
        conceptPageName: 1,
        _id: 1,
        retryTimes: 1,
      })
      .lean(true);

    // Find projects with status ERROR or SUCCESS and non-empty errorUrls
    const errorOrSuccessProjects = await Project.find({
      curriculum: projectType,
      status: { $in: ["ERROR", "SUCCESS", "RETRYING"] },
      errorUrls: { $ne: [] },
    })
      .select({
        errorUrls: 1,
        dirName: 1,
        conceptPageName: 1,
        _id: 1,
        retryTimes: 1,
      })
      .lean(true);

    // Combine and remove duplicates using a Set
    const finalData = [
      ...new Set([
        ...pendingProjects.map(JSON.stringify),
        ...errorOrSuccessProjects.map(JSON.stringify),
      ]),
    ].map(JSON.parse);

    return finalData;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getProjectsMetadata;
