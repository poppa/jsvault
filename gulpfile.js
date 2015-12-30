/* Confiuration */

var BUILD_DIR = '.';
var SRC_DIR   = '.';

/* globals require */

var gulp       = require('gulp'),
    rename     = require('gulp-rename'),
    uglify     = require('gulp-uglify'),
    plumber    = require('gulp-plumber'),
    newer      = require('gulp-newer'),
    livereload = require('gulp-livereload'),
    esLint     = require('gulp-eslint');

var JS_GLOB = SRC_DIR + '/**/*.js',
    NOJS_GLOB = '!' + SRC_DIR + '/**/*.min.js';

gulp.task('js', function() {
  return gulp.src([ JS_GLOB, NOJS_GLOB ])
    .pipe(plumber())
    .pipe(newer(SRC_DIR))
    .pipe(rename({ suffix: '.min.js' }))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(uglify())
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(livereload());
});

gulp.task('lint', function() {
  return gulp.src([ JS_GLOB, NOJS_GLOB ])
    .pipe(plumber())
    .pipe(esLint({ configFile: 'eslintrc.json' }))
    .pipe(esLint.format());
});

gulp.task('default', [ 'lint', 'js' ],
                      function() {
                        livereload.listen();
                        gulp.watch(JS_GLOB, [ 'lint','js' ]);
                      });