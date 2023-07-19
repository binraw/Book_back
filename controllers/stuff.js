const Thing = require("../models/Things");
const fs = require("fs");

exports.modifyThing = (req, res, next) => {
	const thingObject = req.file
		? {
				...JSON.parse(req.body.thing),
				imageUrl: `${req.protocol}://${req.get("host")}/picture/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	delete thingObject._userId;
	Thing.findOne({ _id: req.params.id })
		.then((thing) => {
			if (thing.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				Thing.updateOne(
					{ _id: req.params.id },
					{ ...thingObject, _id: req.params.id }
				)
					.then(() => res.status(200).json({ message: "Objet modifié!" }))
					.catch((error) => res.status(401).json({ error }));
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};
exports.deleteThing = (req, res, next) => {
	Thing.findOne({ _id: req.params.id })
		.then((thing) => {
			if (thing.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = thing.imageUrl.split("/picture/")[1];
				fs.unlink(`picture/${filename}`, () => {
					Thing.deleteOne({ _id: req.params.id })
						.then(() => {
							res.status(200).json({ message: "Objet supprimé !" });
						})
						.catch((error) => res.status(401).json({ error }));
				});
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};
exports.getOneThing = (req, res, next) => {
	Thing.findOne({ _id: req.params.id })
		.then((thing) => res.status(200).json(thing))
		.catch((error) => res.status(404).json({ error }));
};
exports.getAllThing = (req, res, next) => {
	Thing.find()
		.then((things) => res.status(200).json(things))
		.catch((error) => res.status(400).json({ error }));
};
exports.createThing = (req, res, next) => {
	console.log(req.body);
	const thingObject = JSON.parse(req.body.book);
	console.log(thingObject);

	delete thingObject._id;
	delete thingObject._userId;
	const thing = new Thing({
		...thingObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get("host")}/picture/${
			req.file.filename
		}`,
	});

	thing
		.save()
		.then(() => {
			res.status(201).json({ message: "Objet enregistré !" });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.pushRating = async (req, res, next) => {
	const { id } = req.params;
	const { userId, rating } = req.body;

	try {
		// Vérifiez si l'utilisateur a déjà noté ce livre
		const book = await Thing.findById(id);
		const alreadyRated = book.ratings.find((req) => req.userId === userId);

		if (alreadyRated) {
			return res
				.status(400)
				.json({ message: "L'utilisateur a déjà noté ce livre." });
		}
		// Vérifiez si la note est valide (entre 1 et 5)
		if (rating < 1 || rating > 5) {
			return res
				.status(400)
				.json({ message: "La note doit être comprise entre 1 et 5." });
		}
		// Ajoutez la nouvelle notation au tableau "ratings"
		book.ratings.push({ userId, grade: rating });

		// Mettez à jour la note moyenne "averageRating"
		const totalRatings = book.ratings.length;
		const sumRatings = book.ratings.reduce((sum, note) => sum + note.grade, 0);
		book.averageRating = Math.round(sumRatings / totalRatings);

		// Sauvegardez les modifications du livre
		await book.save();

		console.log("Note ajoutée avec succès à la moyenne !");
		// Renvoyez le livre mis à jour en réponse
		res.json(book);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Une erreur est survenue lors de la notation du livre.",
		});
	}
};

exports.getBestRatedBooks = async (req, res, next) => {
	try {
		const books = await Thing.find()
			.sort({ averageRating: -1 }) // Trie les livres par ordre décroissant de la note moyenne
			.limit(3); // Limite les résultats à 3 livres

		res.status(200).json(books);
		console.log(books);
	} catch (error) {
		res.status(500).json({ error: "impossible de recuperer le top 3" });
		console.log("Erreur:", error);
	}
};
