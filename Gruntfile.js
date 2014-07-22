/* TODO: FOLLOWING CODE IS FOR FOLKLIFE, USE AS GUIDE BUT WILL NOT WORK UNTIL MODIFIED  */
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'src/app',
            src: ['**','!**/*.styl','!**/*.jade'],
            dest: 'build/app'},
          {src:['src/index.html'],dest:'build/index.html',filter:'isFile'},
          {src:['src/.htaccess'],dest:'build/.htaccess',filter:'isFile'}
        ]
      }
      // ,
      // optimize: {
      //   files: [
      //     {src:['src/app/libs/es5-sham.min.js'],dest:'prod/app/libs/es5-sham.min.js',filter:'isFile'},
      //     {src:['src/app/libs/es5-shim.min.js'],dest:'prod/app/libs/es5-shim.min.js',filter:'isFile'},
      //     {src:['src/app/libs/html5shiv.js'],dest:'prod/app/libs/html5shiv.js',filter:'isFile'},
      //     {src:['src/app/bootloader.js'],dest:'prod/app/bootloader.js',filter:'isFile'},
      //     {src:['src/app/css/loader.gif'],dest:'prod/app/css/loader.gif',filter:'isFile'},
      //     {src:['src/app/css/owl/grabbing.png'],dest:'prod/app/css/grabbing.png',filter:'isFile'},
      //     {src:['src/index.html'],dest:'prod/index.html',filter:'isFile'},
      //     {expand: true,cwd: 'src/app/css/fonts',src: ['**'],dest: 'prod/app/css/fonts'},
      //     {expand: true,cwd: 'src/app/css/icons',src: ['**'],dest: 'prod/app/css/icons'},
      //     {expand: true,cwd: 'src/build',src: ['**'],dest: 'prod/build'}
      //   ]
      // }
    },

    // requirejs: {
    //   compile: {
    //     options: {
    //       baseUrl: 'src',
    //       paths: {
    //         'dojo': 'empty:',
    //         'dijit': 'empty:',
    //         'dojox': 'empty:',
    //         'esri': 'empty:',
    //         'libs': 'app/libs',
    //         'main': 'app/js/main',
    //         'utils': 'app/js/utils',
    //         'components': 'app/js/components',
    //         // Aliases
    //         'knockout': 'app/libs/knockout-3.1.0',
    //         'react': 'app/libs/react.min',
    //         'dom-style': 'empty:',
    //         'dom-class': 'empty:',
    //         'topic': 'empty:',
    //         'dom': 'empty:',
    //         'on': 'empty:'
    //       },
    //       name: 'build/requireConfig',
    //       out: 'prod/app/js/app.min.js'
    //     }
    //   }
    // },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today() %> */\n',
        report:'min'
      },
      main: {
        files: [{
          expand: true,
          cwd: 'build/app/js/',
          src: ['**/*.js','!**/*.min.js'],
          dest: 'build/app/js/',
          ext: '.js'
        },{
          expand: true,
          cwd: 'build/app/libs/',
          src: ['**/*.js','!**/*.min.js'],
          dest: 'build/app/libs/',
          ext: '.js'
        },
        {
          expand: true,
          cwd: 'build/app/',
          src: ['bootloader.js'],
          dest: 'build/app/',
          ext: '.js'
        }]
      }
      // ,
      // optimize: {
      //   files: {
      //     'prod/app/bootloader.js': ['prod/app/bootloader.js']
      //   }
      // }
    },

    // concat: {
    //   options: {
    //     separator: ""
    //   },
    //   optimize: {
    //     src: [
    //       "src/app/css/app.css",
    //       "src/app/css/fontello.css",
    //       "src/app/css/animation.css",
    //       "src/app/css/owl/owl.carousel.css"
    //     ],
    //     dest: 'prod/app/css/app.css'
    //   }
    // },

    cssmin: {
      options: {
        report: 'min'
      },
      main: {
        expand: true,
        cwd: 'build/app/css/',
        src: ['**/*.css','!**/*.styl'],
        dest: 'build/app/css/',
        ext: '.css'
      }
    },

    htmlmin: {
      main: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [
          {src:['build/index.html'],dest:'build/index.html'},
          {
            expand: true,
            cwd: 'build/app',
            src: ['**/*.html'],
            dest: 'build/app'
          },
          {
            expand: true,
            cwd: 'build/app',
            src: ['**/*.htm'],
            dest: 'build/app'
          }
        ]
      }
    },

    imagemin: {
      main: {
        options: {
          optimizationLevel: 3,
          progressive: true
        },
        files: [{
          expand: true,
          cwd: 'build/app/images/',
          src: ['**/*.png'],
          dest: 'build/app/images/',
          ext: '.png'
        }]
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  // grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Task(s).
  grunt.registerTask('build', ['copy', 'uglify', 'cssmin', 'htmlmin', 'imagemin']);
  // grunt.registerTask('optimize', ['copy:optimize','requirejs','uglify:optimize','concat:optimize','cssmin:optimize','imagemin:optimize']);

};