const sharp = require("sharp");
sharp.cache(false);

const fs = require("fs");

const optimizedImg = async (req, res, next) => {
	// Check if there is a file attached to the request
	if (!req.file) {
		return next();
	}

	try {
		// Use Sharp library to resize and optimize the image
		await sharp(req.file.path)
			.resize({
				width: 400,
				height: 500,
			})
			.webp({ quality: 80 })
			.toFile(`${req.file.path.split(".")[0]}optimized.webp`);

		// Remove the original image file
		fs.unlink(req.file.path, (error) => {
			req.file.path = `${req.file.path.split(".")[0]}optimized.webp`;

			if (error) {
				console.log(error);
			}
			next();
		});
	} catch (error) {
		res.status(500).json({ error: "Unable to optimize the image" });
	}
};

module.exports = optimizedImg;
