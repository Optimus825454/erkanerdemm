import { useState, useEffect } from 'react';
import { Video } from '../../types';
import { videosApi } from '../../services/api';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { VideoModal } from '../../components/modals/VideoModal';

export function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | undefined>(undefined);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videosApi.getAll();
      setVideos(data);
      setError('');
    } catch (err) {
      setError('Videolar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await videosApi.delete(id);
      await fetchVideos();
    } catch (err) {
      setError('Video silinirken bir hata oluştu');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Videolar</h1>
        <button
          onClick={() => {
            setSelectedVideo(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Yeni Video
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/50 transition-colors"
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-sm rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{video.title}</h2>
                <span className={`px-2 py-1 text-sm rounded ${
                  video.published
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {video.published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              
              <p className="text-gray-400 line-clamp-3">{video.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {video.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedVideo(video);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Düzenle"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <a
                  href={video.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Videoyu Görüntüle"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVideo(undefined);
        }}
        onSubmit={async (data) => {
          if (selectedVideo) {
            await videosApi.update(selectedVideo.id, data);
          } else {
            await videosApi.create(data);
          }
          await fetchVideos();
        }}
        video={selectedVideo}
      />
    </div>
  );
}
