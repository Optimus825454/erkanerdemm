import { useState, useEffect } from 'react';
import { BlogPost, CreateBlogPostDto } from '../../types';
import { blogApi } from '../../services/api';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { BlogModal } from '../../components/modals/BlogModal';

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>(undefined);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getAll();
      setPosts(data);
      setError('');
    } catch (err) {
      setError('Blog yazıları yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await blogApi.delete(id);
      await fetchPosts();
    } catch (err) {
      setError('Blog yazısı silinirken bir hata oluştu');
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
        <h1 className="text-2xl font-bold text-white">Blog Yazıları</h1>
        <button
          onClick={() => {
            setSelectedPost(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Yeni Yazı
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/50 transition-colors"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                <span className={`px-2 py-1 text-sm rounded ${
                  post.published
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {post.published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              
              <p className="text-gray-400 line-clamp-3">{post.excerpt}</p>
              
              <div className="flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
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
                      setSelectedPost(post);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Düzenle"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Yazıyı Görüntüle"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPost(undefined);
        }}
        onSubmit={async (data: Omit<BlogPost, 'id' | 'date' | 'slug' | 'readTime'>) => {
          if (selectedPost) {
            // Update işlemi için slug ve readTime'ı selectedPost'tan alıyoruz,
            // geri kalanını formdan gelen data ile birleştiriyoruz.
            // API'nin update fonksiyonu slug ve readTime'ı ayrı bekliyorsa veya
            // BlogPost'un tamamını bekliyorsa ona göre düzenlenmeli.
            // Mevcut durumda UpdateBlogPostDto slug ve readTime'ı dışlıyor.
            // Bu nedenle, bu alanları içeren tam bir BlogPost nesnesi göndermek daha güvenli olabilir
            // ya da API'nin Update metodunun sadece güncellenecek alanları almasını sağlamak.
            // Şimdilik, API'nin tam BlogPost nesnesini kabul ettiğini varsayarak ilerleyelim.
            const postToUpdate: BlogPost = {
                ...selectedPost, // id, date, slug, readTime ve diğer mevcut değerler
                ...data, // formdan gelen güncel değerler
            };
            await blogApi.update(selectedPost.id, postToUpdate);
          } else {
            // Create işlemi için slug ve readTime'ı hesaplıyoruz.
            const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const readTime = Math.ceil(data.content.split(/\s+/).length / 200);
            const createPayload: CreateBlogPostDto & { slug: string; readTime: number } = {
              ...data,
              slug,
              readTime,
              tags: data.tags || [], // tags undefined ise boş dizi ata
            };
            await blogApi.create(createPayload);
          }
          await fetchPosts();
        }}
        post={selectedPost}
      />
    </div>
  );
}
