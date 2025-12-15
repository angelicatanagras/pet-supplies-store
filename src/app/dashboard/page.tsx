'use client';

import { useState, useEffect } from 'react';
import { DashboardStats, Product } from '@/types';
import { ProductList } from '@/components/inventory/ProductList';
import { ProductCategoryChart } from '@/components/charts/ProductCategoryChart';
import { StockLevelsChart } from '@/components/charts/StockLevelsChart';
import { CategoryValueChart } from '@/components/charts/CategoryValueChart';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, productsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/products'),
        ]);

        const statsData = await statsRes.json();
        const productsData = await productsRes.json();

        setStats(statsData);
        setAllProducts(productsData);
        setRecentProducts(productsData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Low Stock Items" value={stats.lowStockItems} />
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
      </div>

      {allProducts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <ProductCategoryChart products={allProducts} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <StockLevelsChart products={allProducts} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <CategoryValueChart products={allProducts} />
            </div>
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
      {recentProducts.length > 0 ? (
        <ProductList products={recentProducts} />
      ) : (
        <p className="text-gray-500">No products yet. Add your first product!</p>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
