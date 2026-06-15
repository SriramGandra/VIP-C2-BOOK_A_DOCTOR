const express = require('express');
const {
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All document routes are protected for Patients
router.use(protect, authorize('Patient'));

router.post('/', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

module.exports = router;
