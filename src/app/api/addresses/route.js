import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const userData = await User.findById(user.userId).select("addresses");

    return NextResponse.json({ addresses: userData?.addresses || [] });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { message: "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    if (body.isDefault) {
      await User.updateMany(
        { _id: user.userId },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const userData = await User.findByIdAndUpdate(
      user.userId,
      { $push: { addresses: body } },
      { new: true }
    );

    const newAddress = userData.addresses[userData.addresses.length - 1];

    return NextResponse.json(
      { message: "Address added successfully", address: newAddress },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add address error:", error);
    return NextResponse.json(
      { message: "Failed to add address" },
      { status: 500 },
    );
  }
}
