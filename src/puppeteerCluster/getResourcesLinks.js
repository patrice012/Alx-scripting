const Resource = require("../db/resource.model");

const getResourcesMetadata = async ({ projectType = "ALX" }) => {
  try {
    let data = await Resource.find({ type: projectType })
      .select({ project: 1, relatedLinks: 1, _id: 1, retryTimes: 1 })
      .lean(true);
    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getResourcesMetadata;
