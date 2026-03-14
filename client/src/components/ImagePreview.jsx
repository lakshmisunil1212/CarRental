import React, { useState } from "react";

// Simple component used in car create/edit forms to show an image URL preview
// and display a message if the URL fails to load.
export default function ImagePreview({ url }) {
  const [error, setError] = useState(false);

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 mb-2">Image Preview:</p>
      {error ? (
        <p className="text-xs text-red-500">Unable to load image</p>
      ) : (
        <img
          src={url}
          alt="Preview"
          className="h-32 w-32 object-cover rounded-lg"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
