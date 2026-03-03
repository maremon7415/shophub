import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { verifyToken } from "@/lib/utils";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      recentOrders,
      salesData,
      topProducts,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find()
        .populate("userId", "name email")
        .sort("-createdAt")
        .limit(10),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $sort: { totalSold: -1 } },
      ]),
    ]);

    const totalRevenue = salesData.reduce((sum, day) => sum + day.total, 0);
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      stock: { $lte: 10 },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      },
      recentOrders,
      salesData,
      topProducts,
      categoryStats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
