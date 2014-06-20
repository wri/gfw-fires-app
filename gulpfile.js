var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var minifyhtml = require('gulp-minify-html');

var app_dir = {
    src: __dirname + "/src/",
    build: __dirname + "/build/",
    css: __dirname + "/src/app/css/",
    js: __dirname + "/src/app/js/",
    root: __dirname + "/"
};

gulp.task('default', function() {
    console.log(app_dir.src);
    // place code for your default task here
});

/*********DEVELOP************/

gulp.task('compile-stylus', function() {
    gulp.src(app_dir.src + '**/*.styl')
        .pipe(stylus({
            errors: true,
            pretty: true
        }))
        .pipe(gulp.dest(app_dir.src));
});

gulp.task('compile-jade', function() {
    gulp.src(app_dir.src + '**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(app_dir.src));
});

gulp.task('develop', function() {
    // watch jade and style
    gulp.watch(app_dir.src + '**/*.styl', ['compile-stylus']);
    gulp.watch(app_dir.src + '**/*.jade', ['compile-jade']);

});

/*********BUILD************/

gulp.task('compress', function() {
    return gulp.src(app_dir.src + '**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(app_dir.build))
});

gulp.task('build', ['compress']);