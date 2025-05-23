import { Project, BlogPost, Video, Category, CreateCategoryDto, UpdateCategoryDto, ImageUploadResponse } from '../types';
import { apiClient } from './apiClient';
import { config } from '../config/config';

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects');
  },

  create: async (project: Omit<Project, 'id' | 'date'>): Promise<Project> => {
    return apiClient.post<Project>('/projects', project, true);
  },

  update: async (id: string, project: Omit<Project, 'id' | 'date'>): Promise<Project> => {
    return apiClient.put<Project>(`/projects/${id}`, project, true);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/projects/${id}`, true);
  },
};

// Blog Posts API
export const blogApi = {
  getAll: async (): Promise<BlogPost[]> => {
    return apiClient.get<BlogPost[]>('/blog');
  },

  create: async (post: Omit<BlogPost, 'id' | 'date'>): Promise<BlogPost> => {
    return apiClient.post<BlogPost>('/blog', post, true);
  },

  update: async (id: string, post: Omit<BlogPost, 'id' | 'date'>): Promise<BlogPost> => {
    return apiClient.put<BlogPost>(`/blog/${id}`, post, true);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/blog/${id}`, true);
  },
};

// Videos API
export const videosApi = {
  getAll: async (): Promise<Video[]> => {
    return apiClient.get<Video[]>('/videos');
  },

  create: async (video: Omit<Video, 'id' | 'date'>): Promise<Video> => {
    return apiClient.post<Video>('/videos', video, true);
  },

  update: async (id: string, video: Omit<Video, 'id' | 'date'>): Promise<Video> => {
    return apiClient.put<Video>(`/videos/${id}`, video, true);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/videos/${id}`, true);
  },
};

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<{ token: string; refreshToken: string }> => {
    return apiClient.post<{ token: string; refreshToken: string }>('/auth/login', credentials);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories');
  },

  getBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${slug}`);
  },

  create: async (category: CreateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>('/categories', category, true);
  },

  update: async (id: string, category: UpdateCategoryDto): Promise<Category> => {
    return apiClient.put<Category>(`/categories/${id}`, category, true);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/categories/${id}`, true);
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${config.apiUrl}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Resim yüklenirken bir hata oluştu');
    }

    return response.json();
  },

  deleteImage: async (filename: string): Promise<void> => {
    return apiClient.delete(`/uploads/${filename}`, true);
  },
};
