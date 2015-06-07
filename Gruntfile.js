module.exports = function (grunt){
  require('load-grunt-tasks')(grunt);
  grunt.initConfig(require('require-dir')('./grunt/tasks'));

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean', 'compile', 'shell:standalone', 'copy']); 
  grunt.registerTask('compile', ['browserify']);
  grunt.registerTask('test', ['lint']);
  grunt.registerTask('lint', ['eslint']);
};

