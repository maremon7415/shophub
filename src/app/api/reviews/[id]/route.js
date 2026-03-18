import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { verifyToken } from '@/lib/utils';

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const { id } = params;
    const data = await request.json();
    
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Only owner or admin can edit
    if (review.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If it's the owner editing, change status back to pending
    // If it's an admin, they might be updating the status directly
    if (user.role === 'admin' && data.status) {
      review.status = data.status;
    } else if (review.userId.toString() === user.userId) {
      review.status = 'pending';
      if (data.rating) review.rating = data.rating;
      if (data.title) review.title = data.title;
      if (data.comment) review.comment = data.comment;
      if (data.images) review.images = data.images;
    }

    review.updatedAt = Date.now();
    await review.save();

    return NextResponse.json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    // Only owner or admin can delete
    if (review.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
