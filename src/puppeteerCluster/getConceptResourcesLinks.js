const ConceptResource = require("../db/conceptResource.model");

const getConceptResourcesMetadata = async ({ projectType = "ALX" }) => {
  try {
    const pendingConcepts = await ConceptResource.find({
      type: projectType,
      status: "PENDING",
      retryTimes: { $lt: 5 },
    })
      .select({
        concept: 1,
        relatedLinks: 1,
        _id: 1,
        retryTimes: 1,
      })
      .lean(true);

    const errorOrSuccessConcepts = await ConceptResource.find({
      type: projectType,
      status: { $in: ["ERROR", "SUCCESS", "RETRYING"] },
      errorUrls: { $ne: [] },
      retryTimes: { $lt: 5 },
    })
      .select({
        concept: 1,
        errorUrls: 1,
        _id: 1,
        retryTimes: 1,
      })
      .lean(true);

    const finalData = [
      ...new Set([
        ...pendingConcepts.map(JSON.stringify),
        ...errorOrSuccessConcepts.map(JSON.stringify),
      ]),
    ].map(JSON.parse);

    return finalData;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getConceptResourcesMetadata;
