module.exports = {
  scripts: {
    files: [
      {
        expand: true,
        cwd: 'src/scripts/',
        src: ['*.js'],
        dest: 'build/scripts/',
        ext: '.js',
        extDot: 'first'
      }
    ],
    options: {
      transform: ['brfs'],
      banner: 'Created by Seth McLaughlin <www.sethmcl.com>'
    }
  }
};
