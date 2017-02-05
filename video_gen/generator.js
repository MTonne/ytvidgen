const Promise = require('promise');
const fs = require('fs');
const spawn = require('child_process').spawn;


const folders = {
	avs: ['tmp', 'avs']
	, mp4: ['tmp', 'mp4']
};
function generateFileNames()
{
	const fileName = 'video-' + (new Date()).toISOString().replace(/:/g, '-');
	return Promise.resolve({
		fileName: fileName
		, avs: './' + folders.avs.join('/') + '/' + fileName + '.avs'
		, avsWin: folders.avs.join('\\') + '\\' + fileName + '.avs'
		, mp4: './' + folders.mp4.join('/') + '/' + fileName + '.mp4'
		, mp4Win: folders.mp4.join('\\') + '\\' + fileName + '.mp4'
	});
}

function convertToMovieFile(fileNames)
{
	// execute FFMpeg to convert avs to mp4
	return new Promise((resolve, reject) =>
	{
		let output = '';
		const child = spawn(
			'ffmpeg'
			, ['-i', fileNames.avsWin, '-y', fileNames.mp4Win]
		);
		child.stdout.on('data', function(data)
		{
			output += data.toString('utf8');
		});
		child.stderr.on('data', function(data)
		{
			output += data.toString('utf8');
		});
		child.on('close', function(code)
		{
			if (code !== 0)
			{
				console.error(output);
				return reject('ffmpeg exited with code ' + code);
			}
			resolve(output);
		});
	});
}

function computeFrameserverScript(objects)
{
	if (!objects || !objects.length)
	{
		return Promise.reject(new Error('No comments given!'));
	}
	let lines = [];
	lines.push('triangle = ImageSource("../../assets/putThatThereTriangle.png", pixel_type="RGB32")');
	lines.push('circle = ImageSource("../../assets/putThatThereCircle.png", pixel_type="RGB32")');
	lines.push('overlayImage = ImageSource("../../assets/putThatThereOverlay.png", pixel_type="RGB32")');
	lines.push('ImageSource("../../assets/putThatThereBackground.png")');

	for (let objectItem of objects)
	{
		// calculate new coordinates
		let newX = Math.ceil(objectItem.x * 386 + objectItem.y * 10 + 53); 
		let newY = Math.ceil(objectItem.x * 14 + objectItem.y * 345 + 10); 
		// overlay object
		if (objectItem.type == 'triangle' || objectItem.type == 'circle')
		{
			lines.push('Overlay(' + objectItem.type + ', x=' + newX + ', y=' + newY + ', mask=' + objectItem.type + '.ShowAlpha())');
		}
		else
		{
			return Promise.reject(new Error('Object with illegal type!'));
		}
	}
	// overlay the rest of the image
	lines.push('Overlay(overlayImage, mask=overlayImage.ShowAlpha())');
	return Promise.resolve(lines.join('\n'));
}

function writeFrameserverScript(content, fileNames)
{
	return new Promise((resolve, reject) =>
	{
		fs.writeFile(
			fileNames.avs
			, content
			, (error) =>
			{
				if (error) return reject(error);
				resolve();
			}
		);
	});
	// return Promise.denodeify(fs.writeFile)(
	// 	'./video_gen/' + fileName + '.avs'
	// 	, content
	// );

}

exports.main = function (objects)
{
	let fileNames;
	return generateFileNames()
		.then((fNames) =>
		{
			fileNames = fNames;
			return computeFrameserverScript(objects);
		})
		.then((content) => writeFrameserverScript(content, fileNames))
		.then(() =>
		{
			console.log("The AVS file was saved");
			return convertToMovieFile(fileNames);
		})
		.then((output) =>
		{
			console.log('Successfully converted to "%s"', fileNames.mp4);
			return fileNames.mp4;
		})
	;
};
