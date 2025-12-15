import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import { smsService } from '@/lib/sms';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`;

    // Update product stock
    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productName} not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.productName}` },
          { status: 400 }
        );
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Update customer total purchases if customer exists
    if (body.customerId) {
      await Customer.findByIdAndUpdate(body.customerId, {
        $inc: { totalPurchases: body.total },
      });
    }

    const order = await Order.create({
      ...body,
      orderNumber,
      createdBy: session.user.id,
    });

    // Send SMS confirmation if customer has phone number (don't fail if SMS fails)
    if (body.customerPhone) {
      try {
        await smsService.sendOrderConfirmation({
          customerName: body.customerName,
          phone: body.customerPhone,
          orderNumber,
          total: body.total,
        });
      } catch (smsError) {
        console.error('SMS notification failed:', smsError);
        // Continue even if SMS fails
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
