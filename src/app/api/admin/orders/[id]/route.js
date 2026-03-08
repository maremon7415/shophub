import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { verifyToken } from "@/lib/utils";
import { sendOrderStatusUpdate } from "@/lib/email";

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

    const previousOrder = await Order.findById(id);
    const previousStatus = previousOrder?.status;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    ).populate("userId", "name email");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (data.status && data.status !== previousStatus) {
      const userEmail = order.userId?.email || order.guestEmail;
      if (userEmail) {
        sendOrderStatusUpdate(userEmail, order, data.status)
          .catch(err => console.error('Failed to send status update email:', err));
      }
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
