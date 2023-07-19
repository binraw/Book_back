const express = require("express");
const router = express.Router();
const stuffCtrl = require("../controllers/stuff");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/api/books", auth, multer, stuffCtrl.createThing);

router.get("/api/books/:id", stuffCtrl.getOneThing);

router.put("/api/books/:id", auth, multer, stuffCtrl.modifyThing);
router.get("/api/books", stuffCtrl.getAllThing);
router.delete("/api/books/:id", auth, stuffCtrl.deleteThing);
router.post("/api/books/:id/rating", auth, stuffCtrl.pushRating);
router.get("/api/books/bestrating", stuffCtrl.getBestRatedBooks);

module.exports = router;
