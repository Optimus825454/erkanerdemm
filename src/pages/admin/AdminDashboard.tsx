import { useState, useEffect } from 'react';
import { projectsApi, blogApi, videosApi } from '../../services/api';
import { FileText, FolderKanban, Video, TrendingUp } from 'lucide-react';

interface Stats {
  projects: number;
  blogPosts: number;
  videos: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    blogPosts: 0,
    videos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, posts, videos] = await Promise.all([
          projectsApi.getAll(),
          blogApi.getAll(),
          videosApi.getAll(),
        ]);

        setStats({
          projects: projects.length,
          blogPosts: posts.length,
          videos: videos.length,
        });
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h1>
        <p className="text-gray-400">İşte sitenizin genel durumu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projeler */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 mb-1">Toplam Proje</p>
              <h3 className="text-3xl font-bold text-white">{stats.projects}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FolderKanban className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Blog Yazıları */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 mb-1">Blog Yazısı</p>
              <h3 className="text-3xl font-bold text-white">{stats.blogPosts}</h3>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Videolar */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 mb-1">Video</p>
              <h3 className="text-3xl font-bold text-white">{stats.videos}</h3>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Video className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Aktivite Grafiği Placeholder */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Son Aktiviteler</h3>
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-400">Grafik yakında eklenecek</p>
        </div>
      </div>
    </div>
  );
}
