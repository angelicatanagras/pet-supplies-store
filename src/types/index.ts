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

export interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}
