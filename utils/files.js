// const fs = require("fs");
// const { ROOT } = require("../config");

// async function createDir(folderName) {
//   try {
//     fs.mkdir(`${folderName}`, { recursive: true }, (err) => {
//       if (err) throw err;
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }

// const createFileIFNotExists = (filePath) => {
//   fs.access(filePath, (accessError) => {
//     if (accessError) {
//       // if file does'nt exists create an empty one
//       fs.open(filePath, "w", (err, fd) => {
//         if (err) {
//           console.log(err);
//         }
//         fs.close(fd, (err) => {
//           if (err) {
//             console.log(err);
//           }
//         });
//       });
//     }
//   });
// };

// const writeToFile = (data) => {
//   let filePath = `${ROOT}/analytics/state.log`;

//   if (!fs.existsSync(`${ROOT}/analytics`)) {
//     fs.mkdir(`${ROOT}/analytics`, { recursive: true }, (err) => {
//       if (err) throw err;
//     });
//   }
//   fs.appendFile(filePath, data, (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });
// };

// module.exports = { createDir, createFileIFNotExists, writeToFile };

const fs = require("fs").promises;
const { ROOT } = require("../config");

async function createDir(folderName) {
  try {
    await fs.mkdir(`${folderName}`, { recursive: true });
  } catch (err) {
    console.error(err);
  }
}

const createFileIFNotExists = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch (accessError) {
    // if file does'nt exists create an empty one
    try {
      const fd = await fs.open(filePath, "w");
      await fs.close(fd);
    } catch (err) {
      console.log(err);
    }
  }
};

const writeToFile = async (data) => {
  let filePath = `${ROOT}/analytics/state.log`;

  try {
    await fs.access(`${ROOT}/analytics`);
  } catch (err) {
    await fs.mkdir(`${ROOT}/analytics`, { recursive: true });
  }

  try {
    await fs.appendFile(filePath, data);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createDir, createFileIFNotExists, writeToFile };
