const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc, and .docx files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title } = req.body;

    await Resume.updateMany(
      { user: req.userId },
      { isActive: false }
    );

    const resume = new Resume({
      user: req.userId,
      title: title || 'My Resume',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        title: resume.title,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId }).sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/active', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.userId, isActive: true });
    if (!resume) {
      return res.status(404).json({ message: 'No active resume found' });
    }
    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/active/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    await Resume.updateMany({ user: req.userId }, { isActive: false });

    resume.isActive = true;
    await resume.save();

    res.json({ message: 'Resume activated successfully', resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await Resume.deleteOne({ _id: req.params.id });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/download/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(resume.filePath, resume.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
