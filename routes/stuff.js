const express = require("express");
const router = express.Router();
const stuffCtrl = require("../controllers/stuff");
const auth = require("../middleware/auth");

router.post("/api/books ", auth, stuffCtrl.createThing);

router.get("/api/books/:id", stuffCtrl.getOneThing);

router.put("/api/books/:id", stuffCtrl.modifyThing);
router.get("/api/books", stuffCtrl.getAllThing);
router.delete("/api/books/:id ", auth, stuffCtrl.deleteThing);
module.exports = router;
