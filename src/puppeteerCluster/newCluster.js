const { Cluster } = require("puppeteer-cluster");
const debug = require("../../utils/debug");
const { broswerView } = require("../../config");

const newCluster = async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 4,
    // timeout: 960000,
    retryLimit: 2,
    retryDelay: 2000,
    monitor: true,
    puppeteerOptions: broswerView,
  });

  // log on dev mode
  debug(cluster);

  return cluster;
};

module.exports = newCluster;
