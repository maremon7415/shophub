import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { verifyToken } from "@/lib/utils";

export async function PUT(request, { params }) {
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
    const body = await request.json();
    const { id } = params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 },
      );
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true }
    );

    return NextResponse.json({
      message: "Banner updated successfully",
      banner: updatedBanner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json(
      { message: "Failed to update banner" },
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
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();
    const { id } = params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 },
      );
    }

    await Banner.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);
    return NextResponse.json(
      { message: "Failed to delete banner" },
      { status: 500 },
    );
  }
}
