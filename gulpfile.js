var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var simpleBindFileArray = [ 
  'src/simpleBindUtil.js',
  'src/simpleBind.2.0.js',
  'src/bindTypes/simplebind.js',
  'src/bindTypes/simplebindhandler.js',
  'src/bindTypes/simplebindvalue.js',
  'src/bindTypes/simplerepeat.js',
  'src/bindTypes/simpleevent.js',
  'src/bindTypes/simpledata.js',
  'src/bindAugmenters/filters.js'
]; 

var jsHintOpts = { 
  laxComma: true
}

// Lint JS
gulp.task('lint', function() {
  return gulp.src(simpleBindFileArray)
    .pipe(jshint(jsHintOpts))
    .pipe(jshint.reporter('default'));
});

// Concat & Minify JS
gulp.task('minify', function(){
  return gulp.src(simpleBindFileArray)
    .pipe(concat('simpleBind.2.0.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('simpleBind.2.0.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Watch Our Files
gulp.task('watch', function() {
  gulp.watch(simpleBindFileArray, ['lint', 'minify']);
});

// Default
gulp.task('default', ['lint', 'minify', 'watch']);