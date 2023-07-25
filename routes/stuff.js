const express = require("express");
const router = express.Router();
const stuffCtrl = require("../controllers/stuff");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const optimizedImg = require("../middleware/resizeImg");

router.get("/", stuffCtrl.getAllThing);
router.post("/", auth, multer, optimizedImg, stuffCtrl.createThing);

router.get("/bestrating", stuffCtrl.getBestRatedBooks);
router.get("/:id", stuffCtrl.getOneThing);

router.put("/:id", auth, multer, optimizedImg, stuffCtrl.modifyThing);
router.delete("/:id", auth, stuffCtrl.deleteThing);
router.post("/:id/rating", auth, stuffCtrl.pushRating);

module.exports = router;
