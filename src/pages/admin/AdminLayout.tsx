import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FileText, Video, LogOut, Tag } from 'lucide-react';

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('tokenExpiry');
    navigate('/admin/login');
  };

  const isActive = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2 px-4 py-2.5 rounded-lg transition duration-200 ${
      isActive
        ? 'bg-blue-500/20 text-blue-400'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
    }`;

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-700 p-4">
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavLink to="/admin" end className={isActive}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink to="/admin/projects" className={isActive}>
              <FolderKanban className="w-5 h-5" />
              <span>Projeler</span>
            </NavLink>
            
            <NavLink to="/admin/blog" className={isActive}>
              <FileText className="w-5 h-5" />
              <span>Blog</span>
            </NavLink>
            
            <NavLink to="/admin/videos" className={isActive}>
              <Video className="w-5 h-5" />
              <span>Videolar</span>
            </NavLink>

            <NavLink to="/admin/categories" className={isActive}>
              <Tag className="w-5 h-5" />
              <span>Kategoriler</span>
            </NavLink>
          </nav>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200 mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
