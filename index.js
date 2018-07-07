const se = require('shell-escape');

module.exports = function(options) {
  options = options || {};
  options.tifig = options.tifig || 'tifig';
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
    const relevant = Object.keys(req.files).filter(key => types[req.files[key].type] || req.files[key].name.match(/\.(heic|heif)$/));
    Promise.all(relevant.map(key => {
      const file = req.files[key];
      const newName = file.name.replace(/\.[^\.]+$/, '.jpg');
      const newPath = file.path.replace(/\.[^\.]+$/, '.jpg');
      const newType = 'image/jpeg';
      return new Promise((resolve, reject) => {
        require('child_process').exec(se([ options.tifig, file.path, newPath ]), { encoding: 'utf8' }, function(error, stdout, stderr) {
          if (error) {
            console.log(stdout);
            console.error(stderr);
            return reject(error);
          }
          file.name = newName;
          // Avoid leaking many megabytes of disk space
          require('fs').unlinkSync(file.path);
          file.path = newPath;
          file.type = newType;
          return resolve(true);
        });
      });
    })).then(o => {
      return next();
    }).catch(e => {
      res.status(500).send('error');
    });
  }
};

