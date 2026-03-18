import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Review from "@/lib/models/Review";
import { verifyToken } from "@/lib/utils";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    const [pendingOrders, lowStockProducts, pendingReviews] = await Promise.all([
      Order.countDocuments({ status: "pending" }),
      Product.countDocuments({ isActive: true, stock: { $lte: 10 } }),
      Review.countDocuments({ status: "pending" })
    ]);

    return NextResponse.json({
      pendingOrders,
      lowStockProducts,
      pendingReviews
    });
  } catch (error) {
    console.error("Get admin badges error:", error);
    return NextResponse.json(
      { message: "Failed to fetch badges" },
      { status: 500 },
    );
  }
}
