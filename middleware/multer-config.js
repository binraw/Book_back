const multer = require("multer");
const sharp = require("sharp");
const SharpMulter = require("sharp-multer");

const storage = SharpMulter({
	destination: (req, file, callback) => {
		callback(null, "picture");
	},

	imageOptions: {
		fileFormat: "webp",
		resize: { width: 500, height: 400, resizeMode: "cover" },
	},
});

module.exports = multer({ storage }).single("image");
