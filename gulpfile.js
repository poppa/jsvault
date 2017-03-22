/* Confiuration */

var BUILD_DIR = '.';
var SRC_DIR   = '.';

/* globals require */

var gulp       = require('gulp'),
    babel      = require('gulp-babel'),
    rename     = require('gulp-rename'),
    uglify     = require('gulp-uglify'),
    plumber    = require('gulp-plumber'),
    filesize   = require('gulp-filesize'),
    esLint     = require('gulp-eslint');

var JS_GLOB    = SRC_DIR + '/**/*.js',
    NOJS_GLOB  = '!' + SRC_DIR + '/**/*.min.js',
    NOJS_GLOB2 = '!' + SRC_DIR + '/node_modules/**',
    NOJS_GLOB3 = '!' + SRC_DIR + '/gulpfile.js';

gulp.task('js', function() {
  return gulp.src([ JS_GLOB, NOJS_GLOB, NOJS_GLOB2, NOJS_GLOB3 ])
    .pipe(plumber())
    .pipe(babel())
    .pipe(uglify({ preserveComments: 'license' }))
    .pipe(filesize())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('lint', function() {
  return gulp.src([ JS_GLOB, NOJS_GLOB, NOJS_GLOB2 ])
    .pipe(plumber())
    .pipe(esLint({ configFile: 'eslintrc.json' }))
    .pipe(esLint.format());
});

gulp.task('default', [ 'lint', 'js' ],
                      function() {
                        gulp.watch(JS_GLOB, [ 'lint','js' ]);
                      });
