// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/photo-gallery', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Define the Image model
const Image = mongoose.model('Image', new mongoose.Schema({
  url: String,
  description: String,
}));

// Route to upload an image
app.post('/api/upload', upload.single('image'), (req, res) => {
  const newImage = new Image({
    url: `http://localhost:5000/uploads/${req.file.filename}`,
    description: req.body.description,
  });
  newImage.save().then(image => res.json(image)).catch(err => res.status(400).json(err));
});
// delete the the file from uploads
const fs = require('fs');

// Route to delete an image
app.delete('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Delete the file from the uploads directory
    const filePath = path.join(__dirname, 'uploads', path.basename(image.url));
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Failed to delete image file' });
      }

      // Delete the image document from MongoDB
      Image.findByIdAndDelete(req.params.id)
        .then(() => res.json({ msg: 'Image deleted successfully' }))
        .catch(err => res.status(500).json({ msg: 'Failed to delete image from database' }));
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Route to get all images with pagination
app.get('/api/images', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  Image.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .then(images => res.json(images))
    .catch(err => res.status(400).json(err));
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
