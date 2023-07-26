const fs = require("fs");
const path = require("path");

const renameFileMiddleware = (req, res, next) => {
	const oldFileName = path
		.parse(req.file.originalname)
		.name.split(" ")
		.join("_"); // Obtient le nom de fichier d'origine sans espaces

	const timestamp = Date.now(); // Obtient un horodatage unique
	const newFilename = `${oldFileName}_${timestamp}.webp`; // Génère un nouveau nom de fichier en ajoutant l'horodatage et l'extension webp

	const newPath = path.join(__dirname, "..", "picture", newFilename); // Définit le nouveau chemin du fichier

	// Utilise fs.rename pour renommer le fichier
	fs.rename(req.file.path, newPath, (error) => {
		if (error) {
			return next(error);
		}
		req.file.filename = newFilename; // Met à jour le nom de fichier dans la requête
		next();
	});
};

module.exports = renameFileMiddleware;
