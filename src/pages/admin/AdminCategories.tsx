import { useState, useEffect } from 'react';
import { Category } from '../../types';
import { categoriesApi } from '../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CategoryModal } from '../../components/modals/CategoryModal';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await categoriesApi.delete(id);
      await fetchCategories();
    } catch (err) {
      setError('Kategori silinirken bir hata oluştu');
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
        <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
        <button
          onClick={() => {
            setSelectedCategory(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Yeni Kategori
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/50 transition-colors"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Düzenle"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-gray-400">{category.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>
                  {category._count?.blogPosts || 0} Blog Yazısı
                </span>
                <span>
                  {category._count?.videos || 0} Video
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(undefined);
        }}
        onSubmit={async (data) => {
          if (selectedCategory) {
            await categoriesApi.update(selectedCategory.id, data);
          } else {
            await categoriesApi.create(data);
          }
          await fetchCategories();
        }}
        category={selectedCategory}
      />
    </div>
  );
} 