var minifyhtml = require('gulp-minify-html');
var minifycss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var jade = require('gulp-jade');
var gulp = require('gulp');
var del = require('del');

var app_dir = {
    src: __dirname + "/src/",
    build: __dirname + "/build/",
    css: __dirname + "/src/app/css/",
    js: __dirname + "/src/app/js/",
    root: __dirname + "/"
};

gulp.task('clean', function(cb) {
    del(app_dir.build, cb);
});

gulp.task('minify-html', function() {
    return gulp.src(app_dir.src + '**/*.htm*')
        .pipe(minifyhtml({
            comments: false,
            spare: true
        }))
        .pipe(gulp.dest(app_dir.build));
});

gulp.task('minify-css', function() {
    return gulp.src(app_dir.src + '**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest(app_dir.build));
});

gulp.task('minify-images', function() {
    return gulp.src(app_dir.src + 'app/**/*.{png,jpg,gif}')
        .pipe(imagemin({
            optimizationLevel: 7,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(app_dir.build + 'app'));
});

gulp.task('minify-js', function() {
    return gulp.src(app_dir.src + '**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(app_dir.build));
});

gulp.task('copy', ['copy-fonts', 'copy-access']);
gulp.task('copy-fonts', function() {
    return gulp.src(app_dir.src + 'app/fonts/**/*')
        .pipe(gulp.dest(app_dir.build + 'app/fonts'));
});
gulp.task('copy-access', function() {
    return gulp.src(app_dir.src + '.htaccess')
        .pipe(gulp.dest(app_dir.build));
});

gulp.task('watch-stylus', function() {
    return gulp.src(app_dir.src + '**/*.styl')
        .pipe(stylus({
            errors: true,
            pretty: true
        }))
        .pipe(gulp.dest(app_dir.src));
});

gulp.task('watch-jade', function() {
    return gulp.src(app_dir.src + '**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(app_dir.src));
});

gulp.task('watch', function() {
    // Run the Compilation
    gulp.start('watch-stylus', 'watch-jade');
    // Then Start the Watch
    gulp.watch(app_dir.src + '**/*.styl', ['watch-stylus']);
    gulp.watch(app_dir.src + '**/*.jade', ['watch-jade']);
});

gulp.task('build', ['clean'], function() {
    gulp.start('minify-html', 'minify-css', 'minify-images', 'minify-js', 'copy');
});