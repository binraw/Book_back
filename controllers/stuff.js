const Thing = require("../models/Things");
const fs = require("fs");

exports.modifyThing = (req, res, next) => {
	const thingObject = req.file
		? {
				...JSON.parse(req.body.book),
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
				// Supprimer l'ancienne image si une nouvelle image est téléchargée
				if (req.file && thing.imageUrl) {
					const filename = thing.imageUrl.split("/picture/")[1];
					fs.unlink(`picture/${filename}`, (err) => {
						if (err) {
							console.error(
								"Erreur lors de la suppression de l'ancienne image :",
								err
							);
						}
					});
				}

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
	if (!Thing) {
		return res.status(404).json({ error: "Livre non trouvé" });
	}
	if (typeof Thing !== "function") {
		res.status(400).json({ error: "Dataset is not a function" });
	}
	Thing.findOne({ _id: req.params.id })
		.then((book) => {
			res.status(200).json(book);
		})
		.catch((error) => {
			res
				.status(500)
				.json({ error: "Erreur lors de la récupération du livre" });
		});
};
exports.getAllThing = (req, res, next) => {
	Thing.find()
		.then((things) => res.status(200).json(things))
		.catch((error) => res.status(400).json({ error }));
};
exports.createThing = (req, res, next) => {
	const thingObject = JSON.parse(req.body.book);
	console.log(thingObject);

	delete thingObject._id;
	delete thingObject._userId;
	const imageUrl = `${req.protocol}://${req.get("host")}/picture/${
		req.file.filename
	}`;
	const thing = new Thing({
		...thingObject,
		userId: req.auth.userId,
		imageUrl: imageUrl,
	});

	thing
		.save()
		.then(() => {
			res.status(201).json({ message: "Objet enregistré !" });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
	console.log(imageUrl);
};

exports.pushRating = (req, res, next) => {
	const { id } = req.params;
	const { userId, rating } = req.body;

	console.log(typeof rating);
	if (!rating) {
		return res.status(400).json({ error: "Rating must not be empty." });
	}

	if (typeof rating !== "number") {
		return res.status(400).json({ error: "Rating must be a number." });
	}

	if (rating < 0 || rating > 5) {
		return res.status(400).json({ error: "Rating must be between 0 and 5." });
	}

	Thing.findById(id)
		.then((book) => {
			if (!book) {
				return res.status(404).json({ error: "Book not found." });
			}

			const existingRating = book.ratings.find(
				(rating) => rating.userId === userId
			);

			if (existingRating) {
				return res
					.status(400)
					.json({ error: "This user has already rated this book." });
			}

			book.ratings.push({ userId, grade: rating });

			const totalRatings = book.ratings.length;
			const sumRatings = book.ratings.reduce(
				(sum, rating) => sum + rating.grade,
				0
			);
			const averageRating = sumRatings / totalRatings;

			book.averageRating = averageRating;

			book
				.save()
				.then((updatedBook) => {
					res.status(200).json(updatedBook);
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.getBestRatedBooks = (req, res) => {
	Thing.find()
		.sort({ averageRating: -1 })
		.limit(3)
		.then((books) => {
			res.status(200).json(books);
		})
		.catch((error) => {
			res.status(400).json(error);
		});
};
