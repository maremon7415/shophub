import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils";

export async function PUT(request, { params }) {
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
    const { id } = params;

    if (body.isDefault) {
      await User.updateMany(
        { _id: user.userId },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const userData = await User.findOneAndUpdate(
      { _id: user.userId, "addresses._id": id },
      { $set: { "addresses.$": { ...body, _id: id } } },
      { returnDocument: 'after' }
    );

    if (!userData) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 },
      );
    }

    const updatedAddress = userData.addresses.find(a => a._id.toString() === id);

    return NextResponse.json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { message: "Failed to update address" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
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
    const { id } = params;

    const userData = await User.findByIdAndUpdate(
      user.userId,
      { $pull: { addresses: { _id: id } } },
      { returnDocument: 'after' }
    );

    if (!userData) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { message: "Failed to delete address" },
      { status: 500 },
    );
  }
}
