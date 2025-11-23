import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();

    const totalProducts = await Product.countDocuments();
    const lowStockItems = await Product.countDocuments({ stock: { $lt: 10 } });

    const revenueResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      totalRevenue: Math.round(totalRevenue),
      pendingOrders: 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
