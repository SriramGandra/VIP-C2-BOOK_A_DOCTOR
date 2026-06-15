const fs = require('fs');
const path = require('path');
const Document = require('../models/document');

// @desc    Upload a new medical document
// @route   POST /api/documents
// @access  Private/Patient
exports.uploadDocument = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      // Clean up uploaded file if validation failed
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Please provide a document title' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const document = await Document.create({
      patient: req.user.id,
      title,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Medical report uploaded successfully'
    });
  } catch (error) {
    // Clean up uploaded file if an error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get patient uploaded documents
// @route   GET /api/documents
// @access  Private/Patient
exports.getDocuments = async (req, res, next) => {
  try {
    // Only patient can see their own documents
    const documents = await Document.find({ patient: req.user.id }).sort('-uploadedAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical document
// @route   DELETE /api/documents/:id
// @access  Private/Patient
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Verify ownership
    if (document.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    // Delete file from disk
    const fileFullPath = path.join(__dirname, '../uploads', document.fileName);
    if (fs.existsSync(fileFullPath)) {
      fs.unlinkSync(fileFullPath);
    }

    // Delete record from DB
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
