// require('./app/index.js');
const videoGen = require('./video_gen/');

videoGen.generate([
	{
		type: 'triangle'
		, x: 0.2
		, y: 0.7
	}
	,{
		type: 'circle'
		, x: 0.8
		, y: 0.2
	}
	,{
		type: 'circle'
		, x: 0.0
		, y: 1
	}
	,{
		type: 'triangle'
		, x: 0.5
		, y: 0.4
	}
])
	.then((fileName) =>
	{
		console.log('Saved file as "%s"', fileName);
	})
	.catch((error) =>
	{
		console.error('Error: ', error);
	})
;
// videoGen.upload();
