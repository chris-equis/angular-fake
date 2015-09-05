var gulp = require('gulp'),

    transpile = require('./_gulp/transpiler'),
    testTask = require('./_gulp/test-task');

gulp.task('build', function() { return transpile(); });
gulp.task('build:test', function() { return transpile({}); });
gulp.task('watch', function() { return transpile(true); });

gulp.task('test', ['build:test'], testTask);

gulp.task('autotest', function() {
  return gulp.watch(['fake/tests/*.js'], ['test']);
});

gulp.task('default', ['watch']);