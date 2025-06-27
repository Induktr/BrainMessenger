'use client';

import React, { useState, useEffect } from 'react';

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  error?: boolean;
  message?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        // The backend is running on a different port, so we need the full URL during development.
        // In a production environment, this would likely be just '/api/link-preview'.
        // We'll assume for now the backend is on port 3001.
        const apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiEndpoint}/link-preview?url=${encodeURIComponent(url)}`);
        const data: PreviewData = await response.json();

        if (data.error) {
          setPreview(null); // Don't show a preview if the backend returned an error
        } else {
          setPreview(data);
        }
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return <div className="link-preview-loader">Loading preview...</div>;
  }

  if (!preview) {
    return null; // Don't render anything if there's no preview data
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="chat-link"
    >
      <div className="link-preview-card">
        {preview.image && (
          <div className="link-preview-image-container">
            <img src={preview.image} alt={preview.title} className="link-preview-image" />
          </div>
        )}
        <div className="link-preview-content">
          <div className="link-preview-sitename">{preview.siteName || new URL(preview.url).hostname}</div>
          <div className="link-preview-title">{preview.title}</div>
          <div className="link-preview-description">{preview.description}</div>
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
