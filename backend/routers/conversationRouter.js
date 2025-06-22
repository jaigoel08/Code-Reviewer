const express = require('express');
const aiController = require("../controllers/conversationController")

const router = express.Router();


router.post("/get-review", aiController.getReview)
router.post("/generate-code", aiController.generateCode)
router.post("/get-output", aiController.getOutput)


module.exports = router;    