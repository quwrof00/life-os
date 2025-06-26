'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/stores/userStore';

export default function Page() {
  const [user, setUser] = useState<null | { name: string; image: string | null }>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  const getUser = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setUsername(data.name || '');
        setImagePreview(data.image || null);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  getUser();
}, []);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(file);
      setImagePreview(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);
  setSuccess(null);

  try {
    if (!username.trim()) {
      throw new Error('Username cannot be empty');
    }

    const formData = new FormData();
    formData.append('username', username.trim());
    
    if (image) {
      formData.append('image', image);
    }
    
    const shouldRemoveImage = !imagePreview && user?.image;
    formData.append('removeImage', shouldRemoveImage ? 'true' : 'false');

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update profile');
    }

    // Update the UI immediately
    setSuccess('Profile updated successfully');
    setImage(null);
    
    // If we uploaded a new image, keep the preview
    // If we removed the image, clear the preview
    if (shouldRemoveImage) {
      setImagePreview(null);
    }
    useProfileStore.getState().setProfile({
    name: result.user.name,
    image: result.user.image,
  });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-neon-blue">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-6 relative overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* circuit lines and dots */}
        </svg>
      </div>
      <div className="absolute inset-0 opacity-10 pointer-events-none scanline-bg"></div>

      {/* Main content */}
      <div className="text-center z-10 w-full max-w-md">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neon-blue mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] tracking-tight">
          Edit Profile
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-neon-blue/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-2 border-neon-blue/50 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-neon-blue/50 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.7)]" />
              </div>
              
              <div className="flex flex-col space-y-3 w-full">
                <label className="cursor-pointer">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="px-4 py-2 bg-neon-blue/20 text-neon-blue text-sm font-bold rounded-lg border border-neon-blue/50 hover:bg-neon-blue/30 transition-all duration-300 text-center">
                    Choose Image
                  </div>
                </label>
                
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-neon-red/20 text-neon-red text-sm font-bold rounded-lg border border-neon-red/50 hover:bg-neon-red/30 transition-all duration-300"
                  disabled={!imagePreview && !user?.image}
                >
                  Remove Picture
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 bg-white/10 border border-neon-blue/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/70"
                maxLength={50}
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {username.length}/50 characters
              </p>
            </div>

            {/* Feedback */}
            {error && (
              <div className="p-3 bg-neon-red/10 text-neon-red rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-neon-green/10 text-neon-green rounded-lg">
                {success}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-10 py-5 text-xl font-bold rounded-2xl border-2 backdrop-blur-lg shadow-xl transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-600/20 border-gray-500/50 text-gray-400'
                  : 'bg-neon-blue/20 border-neon-blue/50 text-neon-blue hover:bg-neon-blue/30'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --neon-blue: #00f0ff;
          --neon-purple: #cc00ff;
          --neon-green: #00ff85;
          --neon-red: #ff4d4d;
        }
        .scanline-bg {
          background-image: linear-gradient(rgba(0, 240, 255, 0.10) 1px, transparent 1px);
          background-size: 100% 8px;
        }
      `}</style>
    </div>
  );
}