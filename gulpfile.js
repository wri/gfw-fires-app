var minifyInline = require('gulp-minify-inline');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var mergeStream = require('merge-stream');
var imagemin = require('gulp-imagemin');
var rupture = require('rupture');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var jeet = require('jeet');
var gulp = require('gulp');

var config = {
  i18n: [
    {
      language: 'en',
      locals: require('./i18n/en/locals.js').locals
    }, {
      language: 'id',
      // locals: require('./i18n/id/locals.js').locals
      locals: require('./i18n/en/locals.js').locals
    }
  ],
  jade: {
    watch: ['src/**/*.jade'],
    src: ['src/**/index.jade', '!**/_*.jade'],
    build: 'build',
    dist: 'dist'
  },
  imagemin: {
    src: 'src/**/*.{png,jpg,gif,svg}',
    build: 'build',
    dist: 'dist'
  },
  stylus: {
    watch: 'src/**/*.styl',
    src: ['src/**/*.styl', '!**/_*.styl'],
    build: 'build',
    dist: 'dist'
  },
  server: {
    files: ['build/**/*.html', 'build/**/*.js', 'build/**/*.css'],
    port: process.env.PORT || 3000,
    baseDir: 'build'
  },
  copy: {
    src: 'vendor/**/*.{js,css,map}',
    build: 'build',
    dist: 'dist'
  }
};

gulp.task('jade-watch', function () {
  gulp.watch(config.jade.watch, ['jade-build']);
});

gulp.task('jade-build', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.jade.src)
        .pipe(jade({ pretty: true, locals: locale.locals }))
        .pipe(minifyInline())
        .pipe(gulp.dest(config.jade.build + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('jade-dist', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.jade.src)
        .pipe(jade({ locals: locale.locals }))
        .pipe(minifyInline())
        .pipe(gulp.dest(config.jade.dist + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('stylus-watch', function () {
  gulp.watch(config.stylus.watch, ['stylus-build']);
});

gulp.task('stylus-build', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.stylus.src)
        .pipe(stylus({ 'include css': true, use: [ jeet(), rupture() ], linenos: true }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(config.stylus.build + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('stylus-dist', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.stylus.src)
        .pipe(stylus({ 'include css': true, use: [ jeet(), rupture() ], compress: true }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(config.stylus.dist + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('imagemin-build', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.imagemin.src)
        .pipe(imagemin({ optimizationLevel: 1 }))
        .pipe(gulp.dest(config.imagemin.build + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('imagemin-dist', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.imagemin.src)
        .pipe(imagemin({ optimizationLevel: 5, progressive: true }))
        .pipe(gulp.dest(config.imagemin.dist + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('copy-build-vendor', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.copy.src)
        .pipe(gulp.dest(config.copy.build + '/' + locale.language + '/vendor'))
    );
  });
  return stream;
})

gulp.task('copy-dist-vendor', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.copy.src)
        .pipe(gulp.dest(config.copy.dist + '/' + locale.language + '/vendor'))
    );
  });
  return stream;
})

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
gulp.task('build', ['stylus-build', 'stylus-watch', 'jade-build', 'jade-watch', 'imagemin-build', 'copy-build-vendor']);
gulp.task('dist', ['stylus-dist', 'jade-dist', 'imagemin-dist', 'copy-dist-vendor']);
