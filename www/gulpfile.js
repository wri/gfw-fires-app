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


gulp.task('dist-delete', function(cb) {
    console.log(">>>>>>>> deleting");
    del([app_dir.build + '**'], cb);
});

gulp.task('dist-copy-clean', ['dist-delete'], function() {
    console.log(">>>>>>>> cleaning up the dist folder");
    //ignore jade, styl, and css inside the js folder
    return gulp.src([app_dir.src + '**', '!' + app_dir.src + '**/*.jade', '!' + app_dir.src + '**/*.styl', '!' + app_dir.src + 'app/js/*.css'])
        .pipe(gulp.dest(app_dir.build));
});



gulp.task('minify-html', ['dist-copy-clean'], function() {
    console.log(">>>>>>>> Minifying HTML");
    var opts = {
        comments: true,
        spare: true
    };
    return gulp.src(app_dir.src + '**/*.htm*')
        .pipe(minifyhtml(opts))
        .pipe(gulp.dest(app_dir.build));
});

gulp.task('minify-css', ['dist-copy-clean'], function() {
    return gulp.src(app_dir.src + '**/*.css')
        //.pipe(minifycss())
        .pipe(gulp.dest(app_dir.build));
});

gulp.task('minify-images', ['dist-copy-clean'], function() {
    return gulp.src(app_dir.src + 'app/**/*.{png,jpg,gif}')
        .pipe(imagemin({
            optimizationLevel: 7,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(app_dir.build + 'app'));
});

gulp.task('minify-js', ['dist-copy-clean'], function() {
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
            linenos: true,
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

gulp.task('build', ['minify-html', 'minify-css', 'minify-images', 'minify-js', 'copy']);
//gulp.task('build', ['minify-html', 'minify-css', 'minify-images', 'minify-js']);