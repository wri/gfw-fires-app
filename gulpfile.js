var minifyInline = require('gulp-minify-inline');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var imagemin = require('gulp-imagemin');
var stylus = require('gulp-stylus');
var locals = require('./locals');
var jade = require('gulp-jade');
var gulp = require('gulp');

var config = {
  imagemin: {
    src: 'src/**/*.{png,jpg,gif,svg}',
    build: 'build',
    dist: 'dist'
  },
  jade: {
    watch: ['src/**/*.jade'],
    src: ['src/**/*.jade'],
    build: 'build',
    dist: 'dist'
  },
  stylus: {
    watch: 'src/**/*.styl',
    src: ['src/css/base.styl', 'src/css/home.styl'],
    build: 'build/css',
    dist: 'dist/css'
  },
  server: {
    files: ['build/**/*.html', 'build/**/*.js', 'build/**/*.css'],
    port: process.env.PORT || 3000,
    baseDir: 'build'
  },
  copy: {
    jquery: { src: 'build/vendor/jquery/dist/jquery.min.js', dest: 'dist/vendor/jquery/dist/'},
    rjs: { src: 'build/vendor/requirejs/require.js', dest: 'dist/vendor/requirejs/'}
  }
};

gulp.task('stylus-watch', function () {
  gulp.watch(config.stylus.watch, ['stylus-build']);
});

gulp.task('stylus-build', function () {
  return gulp.src(config.stylus.src)
    .pipe(stylus({ linenos: true }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(config.stylus.build));
});

gulp.task('stylus-dist', function () {
  return gulp.src(config.stylus.src)
    .pipe(stylus({ compress: true }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(config.stylus.dist));
});

gulp.task('jade-watch', function () {
  gulp.watch(config.jade.watch, ['jade-build']);
});

gulp.task('jade-build', function () {
  return gulp.src(config.jade.src)
    .pipe(jade({ pretty: true, locals: locals }))
    .pipe(gulp.dest(config.jade.build));
});

gulp.task('jade-dist', function () {
  return gulp.src(config.jade.src)
    .pipe(jade({ locals: locals }))
    .pipe(minifyInline())
    .pipe(gulp.dest(config.jade.dist));
});

gulp.task('imagemin-build', function () {
  return gulp.src(config.imagemin.src)
    .pipe(imagemin({ optimizationLevel: 1 }))
    .pipe(gulp.dest(config.imagemin.build));
});

gulp.task('imagemin-dist', function () {
  return gulp.src(config.imagemin.src)
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true
    }))
    .pipe(gulp.dest(config.imagemin.dist));
});

gulp.task('copy-assets', ['babel-polyfill'], function () {
  gulp.src(config.copy.jquery.src)
    .pipe(gulp.dest(config.copy.jquery.dest));
  gulp.src(config.copy.rjs.src)
    .pipe(gulp.dest(config.copy.rjs.dest));
  gulp.src(config.copy.ion.src)
    .pipe(gulp.dest(config.copy.ion.dest));
  gulp.src(config.copy.polyfill.src)
    .pipe(gulp.dest(config.copy.polyfill.dest));
});

gulp.task('browser-sync', function () {
  browserSync({
    server: config.server.baseDir,
    files: config.server.files,
    port: config.server.port,
    reloadOnRestart: false,
    logFileChanges: false,
    ghostMode: false,
    open: false,
    ui: false
  });
});

gulp.task('serve', ['browser-sync']);
gulp.task('start', ['stylus-build', 'stylus-watch', 'jade-build', 'jade-watch', 'imagemin-build']);
gulp.task('dist', ['stylus-dist', 'jade-dist', 'imagemin-dist', 'copy-assets']);
