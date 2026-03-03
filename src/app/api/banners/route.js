import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { verifyToken } from "@/lib/utils";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    let query = {};

    if (position) {
      query.position = position;
    }

    if (activeOnly) {
      query.isActive = true;
      const now = new Date();
      query.$or = [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $exists: false } },
        { endDate: { $exists: false } },
      ];
    }

    const banners = await Banner.find(query)
      .populate("category", "name slug")
      .sort("order -createdAt");

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Get banners error:", error);
    return NextResponse.json(
      { message: "Failed to fetch banners" },
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
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();
    const data = await request.json();

    const banner = await Banner.create(data);

    return NextResponse.json(
      { message: "Banner created successfully", banner },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create banner error:", error);
    return NextResponse.json(
      { message: "Failed to create banner" },
      { status: 500 },
    );
  }
}
