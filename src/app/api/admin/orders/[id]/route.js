import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { verifyToken } from "@/lib/utils";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    const updateData = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.trackingNumber) {
      updateData.trackingNumber = data.trackingNumber;
    }
    if (data.carrier) {
      updateData.carrier = data.carrier;
    }
    if (data.paymentStatus) {
      updateData.paymentStatus = data.paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 },
    );
  }
}
