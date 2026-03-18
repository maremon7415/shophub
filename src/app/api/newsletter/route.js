import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const subscribers = db.collection('subscribers');

    const existingSubscriber = await subscribers.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.unsubscribedAt) {
        await subscribers.updateOne(
          { _id: existingSubscriber._id },
          { $set: { unsubscribedAt: null, updatedAt: new Date() } }
        );
        return NextResponse.json(
          { message: 'You have been re-subscribed to the newsletter!' },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: 'This email is already subscribed to our newsletter' },
        { status: 400 }
      );
    }

    await subscribers.insertOne({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      unsubscribedAt: null,
    });

    return NextResponse.json(
      { message: 'Successfully subscribed to the newsletter!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const subscribers = db.collection('subscribers');

    const totalSubscribers = await subscribers.countDocuments({ unsubscribedAt: null });

    return NextResponse.json({ totalSubscribers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch newsletter stats' },
      { status: 500 }
    );
  }
}
