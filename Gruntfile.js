'use strict';

function getCLOption(grunt, options) {
    var optionValue = false;
    options.forEach(function(option) {
        optionValue = optionValue || grunt.option(option);
    });
    var value = optionValue || false;
    value = (value === true) || (value === 'on');

    return value;
}

module.exports = function(grunt) {
    var inspect = getCLOption(grunt, ['i', 'inspect']);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                files: {
                    'libs/js/overlay-manager.min.js': ['raw/js/overlay-manager.js']
                }
            }
        },
        jshint: {
            files: [
                'Gruntfile.js',
                'raw/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            scripts: {
                files: [
                    'raw/**/*.js'
                ],
                tasks: ['jshint', 'uglify'],
                options: {
                    spawn: false,
                },
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'uglify']);
    grunt.registerTask('dev', ['jshint', 'uglify', 'watch']);
};
