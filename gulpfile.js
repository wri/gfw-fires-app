var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var minifyhtml = require('gulp-minify-html');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
//var pngcrush = require('imagemin-pngcrush');
//var notify = require('gulp-notify');
var clean = require('gulp-clean');

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



gulp.task('compile-jade', function() {
    return gulp.src(app_dir.src + '**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(app_dir.src))
        /*.pipe(notify({
            message: 'Jade Compiled'
        }));*/
});

gulp.task('compile-stylus', function() {
    console.log("COMPILING");
    return gulp.src(app_dir.src + '**/*.styl')
        .pipe(stylus({
            errors: true,
            pretty: true
        }))
        .pipe(gulp.dest(app_dir.src))
        // .pipe(notify({
        //     message: 'Styl Compiled'
        // }));
});

gulp.task('autoprefix-css', ['compile-stylus'], function() {
    console.log("AUTO PREFIXING");

    // return gulp.src(app_dir.src + '**/*.css')
    //     .pipe(autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
    //     .pipe(gulp.dest(app_dir.src))
    // .pipe(notify({
    //     message: 'Auto Prefix done'
    // }));
    return gulp.src(app_dir.src + '**/*.css')
        .pipe(autoprefixer(["last 2 versions"], {
            cascade: true
        }))
        .pipe(gulp.dest(app_dir.src))
        // .pipe(notify({
        //     message: 'Auto Prefix done'
        // }));
});

gulp.task('develop', function() {
    // watch jade and style
    gulp.watch(app_dir.src + '**/*.jade', ['compile-jade']);
    gulp.watch(app_dir.src + '**/*.styl', ['autoprefix-css']);
    //gulp.watch(app_dir.src + '**/*.css', ['autoprefix-css']);

});

/*********BUILD************/

gulp.task('minifycss', function() {
    return gulp.src(app_dir.src + '**/*.css')
        .pipe(minifycss({
            keepBreaks: true
        }))
        .pipe(gulp.dest(app_dir.build))
        // .pipe(notify({
        //     message: 'Minify CSS complete'
        // }));
})

gulp.task('minifyhtml', function() {
    var opts = {
        comments: true,
        spare: true
    };

    return gulp.src(app_dir.src + '**/*.html')
        .pipe(minifyhtml(opts))
        .pipe(gulp.dest(app_dir.build))
        // .pipe(notify({
        //     message: 'Minify HTML complete'
        // }));
});


gulp.task('imagemin', function() {
    return gulp.src(app_dir.src + 'app/images/**/*')
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(app_dir.build + 'app/images'))
        // .pipe(notify({
        //     message: 'Images task complete'
        // }));
});


gulp.task('uglifyjs', function() {
    return gulp.src(app_dir.src + '**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(app_dir.build))
        // .pipe(notify({
        //     message: 'Uglify Complete'
        // }));
});

gulp.task('clean', function() {
    return gulp.src([app_dir.build + '**/*'], {
            read: false
        })
        .pipe(clean());

});

//gulp.task('build', ['uglifyjs']);

// Default task
gulp.task('build', ['clean'], function() {
    gulp.start('uglifyjs', 'imagemin', 'minifyhtml', 'minifycss');
});