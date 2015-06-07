module.exports = {
  src: {
    files: [
      {
        expand: true,
        cwd: 'src',
        src: ['manifest.json', '_locales/**/*', '*.html', 'styles/**/*', 'images/**/*'],
        dest: 'build/'
      }
    ]
  }
};
