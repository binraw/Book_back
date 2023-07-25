const multer = require("multer");
const MINE_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "picture");
	},
	filename: (req, file, callback) => {
		const name = file.originalname.split(" ").join("_");
		const extension = MINE_TYPES[file.mimetype];
		const encodedName = encodeURIComponent(name); // Encoder le nom de fichier correctement
		callback(null, encodedName + Date.now() + "." + extension);
	},
});

module.exports = multer({ storage }).single("image");
