import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { productId, productName, email } = await request.json();

    if (!productId || !email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Product ID and valid email are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const stockNotifications = db.collection('stocknotifications');

    const existingNotification = await stockNotifications.findOne({ 
      productId, 
      email: email.toLowerCase() 
    });

    if (existingNotification) {
      return NextResponse.json(
        { message: 'You are already subscribed to this product' },
        { status: 400 }
      );
    }

    await stockNotifications.insertOne({
      productId,
      productName,
      email: email.toLowerCase(),
      notified: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'You will be notified when this product is back in stock!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Stock notification error:', error);
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const email = searchParams.get('email');

    if (!productId || !email) {
      return NextResponse.json(
        { message: 'Product ID and email are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const stockNotifications = db.collection('stocknotifications');

    const existingNotification = await stockNotifications.findOne({ 
      productId, 
      email: email.toLowerCase() 
    });

    return NextResponse.json({ 
      isSubscribed: !!existingNotification 
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { message: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
