const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		console.log(token);
		const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
		const userId = decodedToken.userId;
		req.auth = {
			userId: userId,
		};
		next();
	} catch (error) {
		console.log(error); // Afficher l'erreur dans la console
		res.status(401).json({
			error: "Unauthorized",
			token: req.headers.authorization,
		});
	}
};
