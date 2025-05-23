import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects').then(module => ({ default: module.Projects })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const Videos = lazy(() => import('./pages/Videos').then(module => ({ default: module.Videos })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects').then(module => ({ default: module.AdminProjects })));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog').then(module => ({ default: module.AdminBlog })));
const AdminVideos = lazy(() => import('./pages/admin/AdminVideos').then(module => ({ default: module.AdminVideos })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(module => ({ default: module.AdminCategories })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  const token = localStorage.getItem('adminToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');

  // Token'ın geçerliliğini kontrol et
  const isTokenValid = () => {
    if (!token || !tokenExpiry) return false;
    return parseInt(tokenExpiry) > Date.now();
  };

  if (!isAuthenticated || !isTokenValid()) {
    // Token geçersizse tüm auth bilgilerini temizle
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('tokenExpiry');
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary fallback={<div className="text-center p-4">Üzgünüz, bir hata oluştu. Lütfen sayfayı yenileyin.</div>}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <div className="bg-image"></div>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="categories" element={<AdminCategories />} />
              </Route>

              {/* Public routes */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/projeler" element={<Projects />} />
                        <Route path="/yazilar" element={<Blog />} />
                        <Route path="/videolar" element={<Videos />} />
                        <Route path="/hakkimda" element={<About />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
