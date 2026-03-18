import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import { verifyToken } from '@/lib/utils';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('productId');
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || 'approved'; // Default to only approved reviews

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'highest') sortQuery = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortQuery = { rating: 1, createdAt: -1 };
    if (sort === 'helpful') sortQuery = { 'helpful.length': -1, createdAt: -1 };

    const query = { productId, status };
    
    // Check if user is requesting their own pending/rejected reviews too
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
      const user = verifyToken(token);
      if (user) {
        // If logged in, they can see approved reviews OR their own reviews of any status
        delete query.status;
        query.$or = [
          { status: 'approved' },
          { userId: user.userId }
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount, allApprovedReviews] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name image profileUrl')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
      Review.find({ productId, status: 'approved' }).select('rating').lean()
    ]);

    // Calculate stats
    const stats = {
      averageRating: 0,
      totalReviews: allApprovedReviews.length,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    if (allApprovedReviews.length > 0) {
      const sum = allApprovedReviews.reduce((acc, rev) => {
        stats.ratingDistribution[rev.rating] = (stats.ratingDistribution[rev.rating] || 0) + 1;
        return acc + rev.rating;
      }, 0);
      stats.averageRating = sum / allApprovedReviews.length;
    }

    return NextResponse.json({
      reviews,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const data = await request.json();
    const { productId, rating, title, comment, images } = data;

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ userId: user.userId, productId });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    // Determine if user actually bought the product (simplified for now, ideally check orders)
    // For now we'll just set it to false unless we can verify
    const isVerified = false; 

    const review = await Review.create({
      userId: user.userId,
      productId,
      rating: Number(rating),
      title,
      comment,
      images: images || [],
      isVerified,
      status: 'pending' // Admin needs to approve
    });

    return NextResponse.json({ message: 'Review submitted successfully', review }, { status: 201 });

  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
