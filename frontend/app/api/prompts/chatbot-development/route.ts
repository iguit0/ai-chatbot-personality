import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/prompts/chatbot-development`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chatbot prompts");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching chatbot prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch chatbot prompts" },
      { status: 500 }
    );
  }
}
