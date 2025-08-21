// lib/types.ts
export type GoingStatus = 'undecided' | 'going' | 'not_going';
export type ProductStatus = 'voting' | 'approved' | 'rejected';
export type Priority = 'low' | 'medium' | 'high' | null;

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null; // <— добавлено
  is_admin: boolean;
  status: GoingStatus;
  created_at?: string | null;
}

export interface Equipment {
  id: string;
  name: string;
  image_url: string | null;
  approved: boolean;
  taken_by: string | null;
  proposed_by: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  is_lenten: boolean;
  status: ProductStatus;
  approved_at: string | null;
  votes?: number | null;
}

export interface ShoppingItem {
  id: string;
  title: string;
  note: string | null;
  approved: boolean;
  priority: Priority;
  created_by: string | null;
  approved_by: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PicnicLocation {
  id: 1;
  lat: number;
  lng: number;
  updated_by: string | null;
  updated_at: string | null;
}

export interface ShoppingCheck {
  user_id: string;
  item_id: string;
  checked: boolean;
  updated_at?: string | null;
}
