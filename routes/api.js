const express = require('express');
const {handleHealthcheck} = require("../controllers/defaultController");
const {generatePdf} = require("../controllers/pdfController");
const router = express.Router();

// Routes
router.all('/healthcheck', handleHealthcheck);
router.all('/generate-pdf', generatePdf);


module.exports = router;
