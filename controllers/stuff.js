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

exports.pushRating = (req, res, next) => {
	Thing.findOne({ _id: req.params.id });
	const { ratings } = req.body;

	// Ensure both ratings array and the first element in the array have userId and grade
	if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
		return res
			.status(400)
			.json({ error: "ratings array is required in the request body" });
	}

	const { userId, grade } = ratings[0];

	// Validate grade value (assuming grade is a number between 1 and 5)
	if (!Number.isInteger(grade) || grade < 1 || grade > 5) {
		return res
			.status(400)
			.json({ error: "grade should be a number between 1 and 5" });
	}

	Thing.findById(_id)
		.then((book) => {
			if (!book) {
				return Promise.reject("Book not found");
			}

			// Check if the user already submitted a rating for this book
			const userRating = book.ratings.find(
				(rating) => rating.userId === userId
			);

			if (userRating) {
				// Update the existing rating if the user already rated the book
				userRating.grade = grade;
			} else {
				// Add a new rating if the user hasn't rated the book before
				book.ratings.push({ userId, grade });
			}

			// Recalculate the average rating
			const totalRatings = book.ratings.length;
			const sumGrades = book.ratings.reduce(
				(sum, rating) => sum + rating.grade,
				0
			);
			const averageRating = sumGrades / totalRatings;
			book.averageRating = averageRating;

			return book.save();
		})
		.then((updatedBook) => {
			res.json(updatedBook);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.getBestRatedBooks = (req, res, next) => {
	Thing.find()
		.sort({ averageRating: -1 }) // Trie les livres par ordre décroissant de la note moyenne
		.limit(3) // Limite les résultats à 3 livres
		.then((books) => {
			res.status(200).json(books);
		})
		.catch((error) => {
			res.status(500).json({ error: "Internal server error" });
		});
};
