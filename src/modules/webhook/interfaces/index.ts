export interface WebhookRequest<T = any> {
  id: string;
  url: string;
  headers?: Record<string, string>;
  body: T;
  method: 'post' | 'put' | 'get' | 'delete';
  timeout?: number;
  meta?: Record<string, any>;
  clientId?: string;
  retry?: boolean;
}

export interface WebhookResponse {
  code: number;
  data: any;
}

export interface WebhookAttempt<T = any> {
  id: string;
  url: string;
  headers?: Record<string, string>;
  body: T | null;
  method: 'post' | 'put' | 'get' | 'delete';
  timeout?: number;
  code: number;
  data: any;
  meta?: Record<string, any>;
  clientId?: string;
}
