const fs = require('fs');
const cp = require('child_process');

module.exports = function(options) {
  options = options || {};
  const types = {
    'image/heif': 1,
    'image/heic': 1,
    'image/heif-sequence': 1,
    'image/heic-sequence': 1
  };
  return function(req, res, next) {
    if (!req.files) {
      return next();
    }
    const relevant = [];
    Object.keys(req.files).forEach(function(name) {
      var files = req.files[name];
      if (!Array.isArray(files)) {
        files = [ files ];
      }
      files.forEach(function(file) {
        if (types[file.type] || file.name.toLowerCase().match(/\.(heic|heif)$/)) {
          relevant.push(file);
        }
      });
    });
    const worker = cp.fork(`${__dirname}/worker.js`);
    Promise.all(relevant.map(file => {
      const newName = file.name.replace(/\.[^\.]+$/, '.jpg');
      let newPath = file.path.replace(/\.[^\.]+$/, '.jpg');
      if (!newPath.match(/\.jpg$/)) {
        newPath += '.jpg';
      }
      const newType = 'image/jpeg';
      return new Promise((resolve, reject) => {
        const errorHandler = (error) => {
            console.error(error);
            reject(error);
        };
        worker.once('message', (_message) => {
            file.name = newName;
            // Avoid leaking many megabytes of disk space
            fs.unlinkSync(file.path);
            file.path = newPath;
            file.type = newType;
            // Avoid listener collision
            worker.removeListener('error', errorHandler);
            resolve(true);
        });
        worker.once('error', errorHandler);
        worker.send({ inputPath: file.path, outputPath: newPath });
      });
    })).then(o => {
      // Gracefully kill the child process
      worker.send({ exit: true });
      return next();
    }).catch(e => {
      res.status(500).send('error');
    });
  }
};
