import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OrderDetailsProps } from './types';

export default function OrderDetails({ order }: OrderDetailsProps) {
  if (!order) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p>Select an order to view details</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4">
      <h2 className="text-xl font-semibold mb-4">Order Details</h2>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order._id.toString()}</CardTitle>
          <CardDescription>
            {new Date(order.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="font-semibold">Customer</h3>
              <p>{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Order Items</h3>
            <ul>
              {order.items.map((item) => (
                <li key={item.productId.toString()} className="flex justify-between">
                  <span>
                    {item.productName} (x{item.quantity})
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
