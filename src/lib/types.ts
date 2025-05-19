export interface Item {
  id?: number;
  title: string;
  description?: string;
  category: string;
  status: 'lost' | 'found' | 'claimed';
  location?: string;
  floor?: string;
  room_number?: string;
  date_reported?: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  student_id?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface Admin {
  id: number;
  user_id: number;
  role: string;
  permissions?: string;
  created_at?: string;
  updated_at?: string;
}
