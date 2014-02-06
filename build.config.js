/**
 * Contains the configuration for the build process.
 */
module.exports = {
  compile_dir: "bin",
  build_dir: "build",

  app_files: {
    js: ['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
    jsunit: [ 'src/**/*.spec.js' ],
    sass: 'sass/ns-popover.scss'
  }
};