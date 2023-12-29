const sleep = (ms = undefined) => {
  if (!ms) {
    ms = Math.floor(Math.random() * 2000) + 1;
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
};


module.exports = { sleep };
