const { Cluster } = require("puppeteer-cluster");
const debug = require("../../utils/debug");
const { broswerView } = require("../../config");

const newCluster = async (maxConcurrency = 4, mode = "CONCURRENCY_CONTEXT") => {
  const cluster = await Cluster.launch({
    concurrency:
      mode === "CONCURRENCY_CONTEXT"
        ? Cluster.CONCURRENCY_CONTEXT
        : Cluster.CONCURRENCY_PAGE,
    maxConcurrency: maxConcurrency,
    // timeout: 960000,
    retryLimit: 4,
    retryDelay: 8000,
    monitor: true,
    puppeteerOptions: broswerView,
  });

  // log on dev mode
  debug(cluster);

  return cluster;
};

module.exports = newCluster;
