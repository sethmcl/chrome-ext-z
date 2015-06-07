var path       = require('path');
var fs         = require('fs');
var glob       = require('glob');
var browserify = require('browserify');
var mkdirp     = require('mkdirp');

glob('src/lib/**/*.js', function (err, files) {
  if (err) {
    console.log(err);
    return;
  }

  files.forEach(function (file) {
    var src        = path.resolve(__dirname, '..', file);
    var moduleName = path.basename(file).split('.')[0];
    var dest       = path.resolve(__dirname, '..', 'build', file.replace('src/', ''));

    var b          = browserify({
      entries: [src],
      standalone: moduleName
    });

    mkdirp.sync(path.dirname(dest));
    b.bundle().pipe(fs.createWriteStream(dest));
  });
});
