var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

module.exports = function(watch) {

  var bundler = watchify(browserify('./source/fake.js', {
    debug: true
  }).transform(babel));

  var bundle = function() {
    console.info('... bundling');
    bundler
      .bundle()
      .on('error', function(err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('fake.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  };

  watch && bundler.on('update', bundle);

  bundle();
};