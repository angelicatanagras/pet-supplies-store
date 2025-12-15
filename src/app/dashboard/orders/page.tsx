'use client';

import React, { useState, useEffect } from 'react';
import OrderList from '@/components/orders/OrderList';
import OrderDetails from '@/components/orders/OrderDetails';
import { IOrder } from '@/models/Order';
import { Order } from '@/types';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <OrderList orders={orders} onOrderClick={handleOrderClick} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <OrderDetails order={selectedOrder} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
