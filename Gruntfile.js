module.exports = function(grunt) {

	grunt.initConfig({
		copy: {
			baseHtml: {
				src: 'public/views/base.html',
				dest: 'build/base.html'
			},
			fontAwesome: {
				expand: true,
				flatten: true,
				src: 'bower_components/font-awesome/fonts/*',
				dest: 'build/fonts'
			},
			fontGlyp: {
				expand: true,
				flatten: true,
				src: 'bower_components/bootstrap/fonts/*',
				dest: 'build/fonts'
			}
		},
		useminPrepare: {
			html: 'public/views/base.html',
			options: {
				dest: 'build'
			}
		},
		usemin: {
			html: ['build/base.html']
		}
	});
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-usemin');

	grunt.registerTask('build', [
		'copy',
		'useminPrepare',
		'concat',
		'cssmin',
		'uglify',
		'usemin'
	]);

};
