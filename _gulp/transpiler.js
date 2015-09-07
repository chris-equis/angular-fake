var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

module.exports = function(watch) {

  var bundler = watchify(browserify('./fake/fake.js', {
    debug: true
  }).transform(babelify.configure({
    externalHelpers: true,
    optional: ['runtime']
  })));

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
      .pipe(preprocess({context: {ENV: 'production'}}))
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  };

  watch && bundler.on('update', bundle);

  bundle();
};