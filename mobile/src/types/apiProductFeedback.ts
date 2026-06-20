export type FeedbackType = 'BUG' | 'IMPROVEMENT' | 'OTHER';
export type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface CreateProductFeedbackRequest {
  type: FeedbackType;
  text: string;
}

export interface ProductFeedbackListItemResponse {
  id: number;
  userId: number;
  type: FeedbackType;
  status: FeedbackStatus;
  hasText: boolean;
  createdAt: string;
}

export interface ProductFeedbackDetailsResponse {
  id: number;
  userId: number;
  type: FeedbackType;
  status: FeedbackStatus;
  text: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}
