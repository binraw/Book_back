const express = require("express");
const router = express.Router();
const stuffCtrl = require("../controllers/stuff");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/api/books", auth, multer, stuffCtrl.createThing);

router.get("/api/books/:id", stuffCtrl.getOneThing);

router.put("/api/books/:id", auth, multer, stuffCtrl.modifyThing);
router.get("/api/books", stuffCtrl.getAllThing);
router.delete("/api/books/:id ", auth, stuffCtrl.deleteThing);
module.exports = router;
