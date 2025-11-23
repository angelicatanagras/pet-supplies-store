export interface Variation {
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'food' | 'vitamins' | 'toys' | 'medicine' | 'grooming' | 'accessories';
  subCategory?: 'cat' | 'dog' | 'bird';
  foodType?: 'dry' | 'wet';
  variations?: Variation[];
  image?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  productId: string;
  quantity: number;
  lastUpdated: Date;
  reorderLevel: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalRevenue: number;
  pendingOrders: number;
}
