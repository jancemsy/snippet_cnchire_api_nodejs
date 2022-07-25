'use strict';

const fs = require('fs');

/**
 *
 * @param {String} file
 * @param {object} options
 * @description saves a file to the specified application directory
 * @returns {object} saved file details
 */
const saveFile = (file, options = {}) => {
  if (!file) {
    throw new Error('no file');
  }

  if (!options.destination) {
    throw new Error('no destination specified');
  }
  // TODO: implement file filtering limit file to accept only the format specified in the options

  const { destination } = options;

  const { filename: fileName } = file.hapi;
  const path = `${destination}/${fileName}`;
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const fileStream = fs.createWriteStream(path);

  return new Promise((resolve, reject) => {
    file.on('error', err => reject(err));
    file.pipe(fileStream);
    file.on('error', error => reject(error));
    file.on('end', err => {
      try {
        if (err) {
          return reject(err);
        }

        const fileDetails = {
          fileName,
          mimetype: file.hapi.headers['content-type'],
          destination: `${options.destination}`,
          path,
          size: fs.statSync(path).size
        };
        return resolve(fileDetails);
      }
      catch (error) {
        reject(error);
      }
    });
  });
};

/**
 *
 * @param {String} path
 * @description Reads a file from a server's directory and return a readable response
 * @returns {Boolean} true if file is found otherwise false
 */
const checkIfFileExists = path =>
  new Promise(res => {

    fs.access(path, fs.F_OK, err => {
      if (err) {
        console.error(err);
        return res(false);
      }

      //file exists
      res(true);
    });
  });

;

module.exports = { saveFile, checkIfFileExists };
