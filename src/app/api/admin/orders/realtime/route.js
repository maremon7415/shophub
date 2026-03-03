import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/lib/models/Order";

let clients = new Set();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || request.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { verifyToken } = await import("@/lib/utils");
  const user = verifyToken(token);
  
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now();
      const client = {
        id: clientId,
        controller,
      };
      clients.add(client);

      const sendEvent = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent({ type: "connected", message: "Real-time order tracking enabled" });

      const interval = setInterval(async () => {
        try {
          await connectDB();
          const recentOrders = await Order.find()
            .sort("-createdAt")
            .limit(10)
            .populate("userId", "name email")
            .lean();
          
          sendEvent({ 
            type: "orders_update", 
            orders: recentOrders,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error("SSE interval error:", err);
        }
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clients.delete(client);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(request) {
  try {
    await connectDB();
    const { orderId, status, trackingNumber, carrier } = await request.json();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(carrier && { carrier }),
        updatedAt: new Date()
      },
      { returnDocument: 'after' }
    ).populate("userId", "name email");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const updateEvent = {
      type: "order_updated",
      order,
      timestamp: new Date().toISOString()
    };

    const encoder = new TextEncoder();
    clients.forEach((client) => {
      client.controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateEvent)}\n\n`));
    });

    return NextResponse.json({ order, message: "Order updated and notifications sent" });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 },
    );
  }
}
