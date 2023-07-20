const express = require("express");
const router = express.Router();
const stuffCtrl = require("../controllers/stuff");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, stuffCtrl.createThing);

router.get("/:id", stuffCtrl.getOneThing);

router.put("/:id", auth, multer, stuffCtrl.modifyThing);
router.get("/", stuffCtrl.getAllThing);
router.delete("/:id", auth, stuffCtrl.deleteThing);
router.post("/:id/rating", auth, stuffCtrl.pushRating);
router.get("/bestrating", stuffCtrl.getBestRatedBooks);

module.exports = router;
