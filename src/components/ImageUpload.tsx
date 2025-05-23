import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadApi } from '../services/api';

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export function ImageUpload({ onUpload, currentImage, className = '' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    // Dosya boyutunu kontrol et (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Resim boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Önizleme için URL oluştur
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Resmi yükle
      const response = await uploadApi.uploadImage(file);
      onUpload(response.url);

      // Önizleme URL'sini temizle
      URL.revokeObjectURL(previewUrl);
      setPreview(response.url);
    } catch (err) {
      console.error('Resim yüklenirken hata:', err);
      setError('Resim yüklenirken bir hata oluştu');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Önizleme"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <Upload size={20} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full h-48 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-600 transition-colors"
        >
          <Upload size={24} className="text-gray-400" />
          <span className="text-gray-400">
            {loading ? 'Yükleniyor...' : 'Resim Yükle'}
          </span>
        </button>
      )}

      {error && (
        <div className="mt-2 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 