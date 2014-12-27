module.exports = function(grunt) {
  /**
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-ngmin');

  var userConfig = require('./build.config.js');

  var taskConfig = {
    pkg: grunt.file.readJSON("package.json"),

    meta: {
      banner:
        '/**\n' +
          ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' * <%= pkg.homepage %>\n' +
          ' *\n' +
          ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
          ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
          ' */\n'
    },

    /**
     * Creates a CHANGELOG on a new version.
     */
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        template: 'changelog.tpl'
      }
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          "package.json",
          "bower.json"
        ],
        commit: false,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          "package.json",
          "bower.json"
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },

    /**
     * The copy task just copies files from A to B. We use it here to copy
     * our project javascripts into 'build_dir'.
     */
    copy: {
      js: {
        files: [{
          src: ['<%= app_files.js %>'],
          dest: '<%= build_dir %>/',
          cwd: '.',
          expand: true,
          flatten: true
        }]
      },
      example : {
        files : [{
          src: ['<%= build_dir %>/**/*'],
          dest: '<%= example_dir %>/',
          cwd: '.',
          expand: true,
          flatten: true
        }]
      }
    },

    /**
     * The directories to delete when 'grunt clean' is executed.
     */
    clean: [
      '<%= compile_dir %>',
      '<%= build_dir %>'
    ],

    /**
     * 'grunt concat' concatenates multiple source files into a single file.
     */
    concat: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= app_files.js %>'
        ],
        dest: '<%= compile_dir %>/<%= pkg.name %>.min.js'
      }
    },

    /**
     * 'ng-min' annotates the sources before minifying. That is, it allows us to code
     * without the array syntax.
     */
    ngmin: {
      compile: {
        files: [{
          src: ['<%= concat.compile.dest %>'],
          cwd: '<%= compile_dir %>',
          dest: '<%= concat.compile.dest %>',
          expand: true
        }]
      }
    },

    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= concat.compile.dest %>': '<%= concat.compile.dest %>'
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [
        '<%= app_files.js %>'
      ],
      test: [
        '<%= app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    /**
     * `sass` handles our sass compilation and uglification automatically.
     * Only our `main.sass` file is included in compilation; all other files
     * must be imported from this file.
     */
    sass: {
      build: {
        src: [ '<%= app_files.sass %>' ],
        dest: '<%= build_dir %>/<%= pkg.name %>.css',
        files: {
          '<%= sass.build.dest %>' : '<%= sass.build.src %>'
        },
        options : {
          compass: false,
          lineNumbers: true
        }
      },

      compile: {
        src: [ '<%= app_files.sass %>' ],
        dest: '<%= compile_dir %>/<%= pkg.name %>.css',
        files: {
          '<%= sass.compile.dest %>' : '<%= sass.compile.src %>'
        },
        options : {
          compass: false,
          style: 'compressed',
          banner: '<%= meta.banner %>'
        }
      }
    }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('default', ['build', 'compile']);

  grunt.registerTask('build', ['clean', 'sass:build', 'jshint', 'copy:js', 'copy:example']);

  grunt.registerTask('js', ['clean', 'jshint', 'copy:js', 'copy:example']);

  /**
   * The 'compile' task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask('compile', ['sass:compile', 'concat:compile', 'uglify', 'ngmin']);
};