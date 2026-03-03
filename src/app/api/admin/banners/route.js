import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/lib/models/Banner";
import { verifyToken } from "@/lib/utils";

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
    const body = await request.json();

    const banner = await Banner.create(body);

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

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const position = searchParams.get("position");
    const isActive = searchParams.get("isActive");

    const query = {};

    if (position) {
      query.position = position;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      Banner.find(query)
        .populate("category", "name")
        .sort("order -createdAt")
        .skip(skip)
        .limit(limit),
      Banner.countDocuments(query),
    ]);

    return NextResponse.json({
      banners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get banners error:", error);
    return NextResponse.json(
      { message: "Failed to fetch banners" },
      { status: 500 },
    );
  }
}
