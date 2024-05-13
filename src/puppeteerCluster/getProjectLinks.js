const Project = require("../db/project.model");

const getProjectsMetadata = async (projectType) => {
  try {
    let data = await Project.find({
      curriculum: projectType,
      projectLink: "https://intranet.alxswe.com/projects/301",
    })
      .select({ resources: 1, dirName: 1, conceptPageName: 1 }) //"resources dirName conceptPageName"
      .lean(true);
    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getProjectsMetadata;
