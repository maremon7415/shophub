import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Review from "@/lib/models/Review";
import { verifyToken } from "@/lib/utils";

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = verifyToken(token);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });
    const reviews = await Review.find({ user: id }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(o => o.paymentStatus === 'paid' || o.status === 'delivered')
      .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

    return NextResponse.json({
      totalOrders,
      totalSpent: totalSpent.toFixed(2),
      recentOrders: orders.slice(0, 5),
      recentReviews: reviews.slice(0, 5)
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { message: "Failed to fetch user stats" },
      { status: 500 },
    );
  }
}
