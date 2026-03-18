import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { verifyToken } from '@/lib/utils';

export async function POST(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const { id } = params;
    
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const userIdStr = user.userId.toString();
    const helpfulIndex = review.helpful.findIndex(m => m.toString() === userIdStr);

    if (helpfulIndex > -1) {
      // User already voted helpful, so remove their vote (toggle off)
      review.helpful.splice(helpfulIndex, 1);
    } else {
      // User hasn't voted helpful, add their vote
      review.helpful.push(user.userId);
      // Remove from notHelpful if they were there
      const notHelpfulIndex = review.notHelpful.findIndex(m => m.toString() === userIdStr);
      if (notHelpfulIndex > -1) review.notHelpful.splice(notHelpfulIndex, 1);
    }

    await review.save();

    return NextResponse.json({ message: 'Vote registered successfully', helpful: review.helpful });
  } catch (error) {
    console.error('Helpful vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
