var htmlAutoprefixer = require('gulp-html-autoprefixer');
var minifyInline = require('gulp-minify-inline');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var mergeStream = require('merge-stream');
var version = require('./package.json').version;
var imagemin = require('gulp-imagemin');
var notifier = require('node-notifier');
var cached = require('gulp-cached');
var stylus = require('gulp-stylus');
var babel = require('gulp-babel');
var rupture = require('rupture');
var jade = require('gulp-jade');
var copy = require('gulp-copy');
var jeet = require('jeet');
var gulp = require('gulp');

var plumber = function () {
  return require('gulp-plumber')({
    errorHandler: function (error) {
      notifier.notify({
        title: 'Gulp Error',
        message: error.message,
        sound: true
      });
      console.log(error.message);
      this.emit('end');
    }
  });
};

var config = {
  i18n: [
    {
      language: '/',
      locals: require('./i18n/en/locals.js').locals
    }
  ],
  jade: {
    watch: ['src/**/*.jade'],
    src: ['src/**/index.jade', '!**/_*.jade'],
    build: 'build',
    dist: 'dist'
  },
  babel: {
    watch: ['src/**/*.js'],
    src: ['src/**/*.js'],
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
  polyfill: {
    src: 'vendors/babel-polyfill/browser-polyfill.js',
    base: 'vendors',
    build: 'build',
    dist: 'dist'
  },
  server: {
    files: ['build/**/*.html', 'build/**/*.js', 'build/**/*.css'],
    port: process.env.PORT || 3000,
    server: ['build', 'www']
  },
  copyExtras: {
    src: 'src/**/*.{php,config,sqlite}',
    build: 'build',
    dist: 'dist'
  },
  copy: {
    src: 'vendors/**/*.{js,css,map}',
    build: 'build',
    dist: 'dist'
  }
};

config.i18n.forEach(function (language) {
  language.locals.meta.version = version;
});

gulp.task('jade-watch', function () {
  gulp.watch(config.jade.watch, ['jade-build']);
});

gulp.task('jade-build', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.jade.src)
        .pipe(plumber())
        .pipe(jade({ pretty: true, locals: locale.locals }))
        .pipe(htmlAutoprefixer())
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
        .pipe(htmlAutoprefixer())
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
        .pipe(plumber())
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
        .pipe(gulp.dest(config.stylus.dist + locale.language))
    );
  });
  return stream;
});

gulp.task('babel-watch', function () {
  gulp.watch(config.babel.watch, ['babel-build']);
});

gulp.task('babel-build', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.babel.src)
        .pipe(plumber())
        .pipe(cached('babel-' + locale.language))
        .pipe(babel())
        .pipe(gulp.dest(config.babel.build + '/' + locale.language))
    );
  });
  return stream;
});

gulp.task('babel-dist', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.babel.src)
        .pipe(babel())
        .pipe(gulp.dest(config.babel.dist + locale.language))
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
        .pipe(imagemin({ optimizationLevel: 1}))
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
        .pipe(gulp.dest(config.copy.build + '/' + locale.language + '/vendors'))
    );
  });
  return stream;
});

gulp.task('copy-dist-vendor', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.copy.src)
        .pipe(gulp.dest(config.copy.dist + '/' + locale.language + '/vendors'))
    );
  });
  return stream;
});

gulp.task('copy-build-php', function () {
  var stream = mergeStream();
config.i18n.forEach(function(locale) {
  stream.add(
    gulp.src(config.copyExtras.src)
      .pipe(gulp.dest(config.copyExtras.build + locale.language))
  );
});

  return stream;
});

gulp.task('copy-dist-php', function () {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.copyExtras.src)
      .pipe(gulp.dest(config.copyExtras.dist + locale.language))
    );
  });
  return stream;
});

gulp.task('polyfill-build', function() {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.polyfill.src, { base: config.polyfill.base })
        .pipe(gulp.dest(config.polyfill.build + '/' + locale.language + '/vendors'))
    );
  });
  return stream;
});

gulp.task('polyfill-dist', function() {
  var stream = mergeStream();
  config.i18n.forEach(function(locale) {
    stream.add(
      gulp.src(config.polyfill.src, { base: config.polyfill.base })
        .pipe(gulp.dest(config.polyfill.dist + '/' + locale.language + '/vendors'))
    );
  });
  return stream;
});

gulp.task('browser-sync', function () {
  browserSync({
    server: config.server.server,
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
gulp.task('watch', ['stylus-watch', 'babel-watch', 'jade-watch']);
gulp.task('build', ['stylus-build', 'babel-build', 'jade-build', 'imagemin-build', 'copy-build-vendor', 'copy-build-php']);

gulp.task('dist', ['stylus-dist', 'babel-dist', 'jade-dist', 'imagemin-dist', 'copy-dist-vendor', 'copy-dist-php']);
