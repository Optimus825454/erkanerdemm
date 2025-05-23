// Base types
interface BaseEntity {
  id: string;
  date: string;
}

// Project types
export interface Project extends BaseEntity {
  title: string;
  description: string;
  image?: string;
  link?: string;
  tags: string[];
  featured?: boolean;
  githubLink?: string;
  demoLink?: string;
  technologies: string[];
}

export type CreateProjectDto = Omit<Project, 'id' | 'date'>;
export type UpdateProjectDto = Partial<CreateProjectDto>;

// Category types
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  _count?: {
    blogPosts: number;
    videos: number;
  };
}

export type CreateCategoryDto = Omit<Category, 'id' | 'date' | '_count'>;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// Blog types
export interface BlogPost extends BaseEntity {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  tags?: string[];
  coverImage?: string;
  published: boolean;
  readTime?: number;
  category?: Category;
  categoryId?: string;
}

export type CreateBlogPostDto = Omit<BlogPost, 'id' | 'date' | 'slug' | 'readTime'>;
export type UpdateBlogPostDto = Partial<CreateBlogPostDto>;

// Video types
export interface Video extends BaseEntity {
  title: string;
  embedUrl: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  category?: Category;
  categoryId?: string;
  views?: number;
  likes?: number;
  tags?: string[];
  published: boolean;
}

export type CreateVideoDto = Omit<Video, 'id' | 'date' | 'views' | 'likes'>;
export type UpdateVideoDto = Partial<CreateVideoDto>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth types
export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Filter and Search types
export interface FilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
  category?: string;
  published?: boolean;
}

// Image types
export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
