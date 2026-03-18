import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Review from '@/lib/models/Review';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const user = await User.findById(id).select('name image profileUrl bio isProfilePublic socialLinks createdAt').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isProfilePublic) {
      return NextResponse.json({ error: 'This profile is private' }, { status: 403 });
    }

    // Fetch user's reviews
    const reviews = await Review.find({ userId: id, status: 'approved' })
      .populate('productId', 'name image slug price')
      .sort({ createdAt: -1 })
      .lean();

    // Ensure backwards compatibility where memberSince is derived from createdAt
    user.memberSince = user.createdAt;

    return NextResponse.json({
      user,
      reviews
    });

  } catch (error) {
    console.error('Fetch public profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
