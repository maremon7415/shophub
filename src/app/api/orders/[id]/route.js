import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import "@/lib/models/User";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id: orderNumber } = await params;

    const order = await Order.findOne({ orderNumber })
      .populate("userId", "name email")
      .lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
