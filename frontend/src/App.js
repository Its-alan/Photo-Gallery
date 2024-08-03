import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  const fetchImages = async (page) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/images?page=${page}`);
      setImages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);

    try {
      await axios.post('http://localhost:5000/api/upload', formData);
      fetchImages(page);
      setDescription('');
      setImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteImage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/images/${id}`);
      fetchImages(page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Photo Gallery</h1>
      <form onSubmit={uploadImage}>
        <input
          type="file"
          id="file"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <label htmlFor="file">Choose File</label>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">Upload</button>
      </form>
      <div className="gallery">
        {images.map((img) => (
          <div key={img._id}>
            <img src={img.url} alt={img.description} />
            <p>{img.description}</p>
            <button onClick={() => deleteImage(img._id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default App;
