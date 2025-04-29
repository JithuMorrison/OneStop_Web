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
        .from('blogs')
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
        .from('blogs')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Supabase Feed Upload</h1>
      
      <button 
        onClick={() => setShowUploadDialog(true)}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
      >
        Upload Feed
      </button>

      <button
        onClick={() => window.location.href = '/dashboard'} 
        className="absolute top-4 right-4 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-md"
      >
        Back to Dashboard
      </button>

      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Upload New Feed</h2>
            <input
              type="text"
              placeholder="Enter feed Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <textarea
              placeholder="Enter feed Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedImage && (
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="Preview" 
                  className="image-preview"
                />
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={uploadfeed}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload Feed'}
              </button>
              <button 
                onClick={() => setShowUploadDialog(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {feeds.map((feed) => (
          <div key={feed.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={feed.image_url} 
              alt={feed.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feed.title}</h3>
              <p className="text-gray-600">{feed.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeedPage;