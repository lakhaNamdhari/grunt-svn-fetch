/*
 * grunt-svn-fetch
 * https://github.com/jones/svn-fetch
 *
 * Copyright (c) 2013 Stephen Jones
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	// Flag to check if windows os
	var isWindowsOs = /windows/.test( (require('os').type()).toLowerCase() );

	grunt.registerMultiTask('svn_fetch', 'Updates or checks out the desired files', function () {
		var exec = require('child_process').exec;
		var options = this.options({
			bin:         'svn',
			repository:  '',
			path:        '',
			execOptions: {},
			svnOptions: {}
		});
		var done = this.async();
		var map = this.data.map;
		if (map != undefined) {
			processMap();
		} else {
			grunt.log.error('\n\'map\' missing.');
			done(true);
		}

		function processMap() {
			var paths = Object.keys(map);
			getNextMapping();

			function getNextMapping() {
				if (paths.length > 0) {
					processPath(paths.shift());
				} else {
					grunt.log.write('\n');
					done(true);
				}
			}

			function processPath(path) {
				var command = options.bin;
				var fullPath = options.path + path;
				if (grunt.file.exists(fullPath + '/.svn')) {
					command = [ command, 'update', fullPath ].join(' ');
				} else {
					command = [ command, 'checkout', options.repository + map[path], fullPath ].join(' ');
				}
				for (var key in options.svnOptions) {
					// As in windows os, arguments are passed differently
					if (isWindowsOs){
						command += ' --' + key + " " + options.svnOptions[key] +" "
					}else{
						command += ' --' + key + "='" + options.svnOptions[key] +"'"
					}
				}
				grunt.log.write('Processing ' + fullPath + '\n');
				exec(command, options.execOptions, function (error, stdout) {
					grunt.log.write(stdout);
					if (error !== null) {
						grunt.log.error('\n#' + command + "\n" + error);
					}
					getNextMapping();
				});
			}
		}
	});
};
