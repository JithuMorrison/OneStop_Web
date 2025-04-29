import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import supabase from './supabase';
const bucketName = 'jithu';

function FeedPage() {
  const [feeds, setfeeds] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch feeds from Supabase
  const fetchfeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('feeds')
        .select('*');
      
      if (error) throw error;
      setfeeds(data);
    } catch (error) {
      console.error('Error fetching feeds:', error);
      alert('Error fetching feeds');
    }
  };

  // Upload feed to Supabase
  const uploadfeed = async () => {
    if (!title || !description || !selectedImage) {
      alert('Please fill all fields and select an image');
      return;
    }

    setIsLoading(true);
    try {
      // Upload image to Supabase Storage
      const imageName = `${Date.now()}-${selectedImage.name}`;
      const imagePath = `uploads/${imageName}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(imagePath, selectedImage);
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(imagePath);

      // Insert feed data
      const { error: insertError } = await supabase
        .from('feeds')
        .insert({
          title,
          description,
          image_url: publicUrl
        });
      
      if (insertError) throw insertError;

      // Refresh feeds list
      await fetchfeeds();
      setShowUploadDialog(false);
      setTitle('');
      setDescription('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading feed:', error);
      alert('Error uploading feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchfeeds();
  }, []);

  return (
    <div className="container">
      <h1>Supabase feed Upload</h1>
      
      <button 
        onClick={() => setShowUploadDialog(true)}
        className="upload-button"
      >
        Upload feed
      </button>

      {showUploadDialog && (
        <div className="dialog-backdrop">
          <div className="upload-dialog">
            <h2>Upload New feed</h2>
            <input
              type="text"
              placeholder="Enter feed Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Enter feed Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
              {selectedImage && (
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="Preview" 
                  className="image-preview"
                />
              )}
            </div>
            <div className="dialog-actions">
              <button 
                onClick={uploadfeed}
                disabled={isLoading}
              >
                {isLoading ? 'Uploading...' : 'Upload feed'}
              </button>
              <button 
                onClick={() => setShowUploadDialog(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="feed-list">
        {feeds.map((feed) => (
          <div key={feed.id} className="feed-card">
            <img 
              src={feed.image_url} 
              alt={feed.title} 
              className="feed-image"
            />
            <div className="feed-content">
              <h3>{feed.title}</h3>
              <p>{feed.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeedPage;