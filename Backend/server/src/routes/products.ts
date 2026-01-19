// Install multer: npm install multer
const express = require('express');
const multer = require('multer');
const app = express();

const upload = multer({ dest: 'uploads/' });

app.post('/api/products', upload.array('files', 12), (req, res) => {
  // req.files is an array of uploaded files
  // req.body contains other form fields

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }

  // Example: Save product info and file paths
  const product = {
    ...req.body,
    images: req.files.map(file => file.path),
    createdAt: new Date().toISOString(),
    status: req.body.status || 'pending'
  };

  // TODO: Save product to your database

  res.status(201).json({ success: true, data: product });
});

app.listen(5000, () => console.log('Server running on port 5000'));