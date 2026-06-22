import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function ActivityMediaGallery({ activityId, media, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await api.addActivityMedia(activityId, file);
      }
      toast.success('Media uploaded');
      onChange();
    } catch (err) {
      toast.error(`Failed to upload media: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemove(item) {
    if (!window.confirm('Remove this photo/video?')) return;
    try {
      await api.removeActivityMedia(item.id);
      toast.success('Media removed');
      onChange();
    } catch (err) {
      toast.error(`Failed to remove media: ${err.message}`);
    }
  }

  const items = media || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">Photos &amp; Videos</h4>
        <label className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition cursor-pointer">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading...' : 'Upload'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No photos or videos yet.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              {item.media_type === 'video' ? (
                <video src={item.secure_url} className="w-full h-24 object-cover rounded-lg bg-slate-900" controls />
              ) : (
                <img
                  src={item.secure_url}
                  alt={item.caption || 'Activity photo'}
                  className="w-full h-24 object-cover rounded-lg"
                  loading="lazy"
                />
              )}
              <button
                onClick={() => handleRemove(item)}
                className="absolute top-1 right-1 bg-slate-950/70 text-slate-200 hover:text-red-400 rounded-full p-1 transition opacity-0 group-hover:opacity-100"
                aria-label="Remove media"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
