module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    closureLint: {
      app:{
        closureLinterPath: '/usr/local/bin',
        src: ['jquery.vimeo-srt.js'],
        command: 'gjslint',
        options: {
          stdout: true,
          strict: false
        }
      }
    },
    uglify: {
      options: {
        banner: '/* Vimeo Srt - <%= pkg.description %> - Version: <%= pkg.version %> - Author:  Yomguithereal - License: MIT */\n'
      },
      prod: {
        files: {
          'jquery.vimeo-srt.min.js': ['jquery.vimeo-srt.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-closure-linter');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // By default, will check lint and minify:
  grunt.registerTask('default', ['closureLint', 'uglify']);
};
