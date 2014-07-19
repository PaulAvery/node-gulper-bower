var path = require('path');
var bower = require('main-bower-files');
var es = require('event-stream');
var location = bowerlocation();

function wrap(filetype, type) {
	return {
		name: 'bower',
		output: type,
		glob: ['bower.json', location + '/**/*.' + filetype],
		streamer: function(input) {
			var files = bower();
			var output = es.map(function(file, callback) {
				if(path.basename(file.path) === 'bower.json') {
					files = bower();
					callback();
				} else if(files.indexOf(file.path.replace(process.cwd()+path.sep, '')) !== -1) {
					callback(null, file);
				} else {
					callback();
				}
			});

			return input.pipe(output);
		}
	};
}

function bowerlocation() {
	var rc;
	try {
		rc = require(path.join(process.cwd(), '.bowerrc'));		
	} catch(e) {
		rc = {};
	}

	return rc.directory || 'bower_components';
}

module.exports = {
	js: wrap('js', 'scripts'),
	css: wrap('css', 'styles'),
	assets: wrap('!(js|css)', 'assets')
};