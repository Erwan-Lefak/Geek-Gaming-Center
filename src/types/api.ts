/**
 * API Response and Request Types
 * Standardized types for API communication
 */

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface VisualSearchResult {
  product_id: string;
  similarity_score: number;
  confidence: number;
  match_details: {
    features_matched: string[];
    missing_features: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: {
    product_id?: string;
    booking_id?: string;
    search_query?: string;
  };
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  product_recommendations?: Array<{
    product_id: string;
    reason: string;
  }>;
  booking_suggestions?: Array<{
    resource_type: string;
    date_range: string;
  }>;
}
