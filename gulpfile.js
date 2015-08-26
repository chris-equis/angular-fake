var gulp = require('gulp'),

    transpile = require('./_gulp/transpiler'),
    testTask = require('./_gulp/test-task');

gulp.task('build', function() { return transpile(); });
gulp.task('watch', function() { return transpile(true); });

gulp.task('test', ['build'], testTask);

gulp.task('autotest', function() {
  return gulp.watch(['source/tests/*.js'], ['test']);
});

gulp.task('default', ['watch']);