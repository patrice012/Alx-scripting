const Resource = require("../db/resource.model");

const getResourcesMetadata = async ({ projectType = "ALX" }) => {
  try {
    const pendingResources = await Resource.find({
      type: projectType,
      status: "PENDING",
      retryTimes: { $lt: 5 },
    })
      .select({
        project: 1,
        relatedLinks: 1,
        _id: 1,
        retryTimes: 1,
      })
      .lean(true);

    const errorOrSuccessResources = await Resource.find({
      type: projectType,
      status: { $in: ["ERROR", "SUCCESS", "RETRYING"] },
      errorUrls: { $ne: [] },
      retryTimes: { $lt: 5 },
    })
      .select({
        project: 1,
        errorUrls: 1,
        _id: 1,
        retryTimes: 1,
      })
      .lean(true);

    const finalData = [
      ...new Set([
        ...pendingResources.map(JSON.stringify),
        ...errorOrSuccessResources.map(JSON.stringify),
      ]),
    ].map(JSON.parse);

    return finalData;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getResourcesMetadata;
