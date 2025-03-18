import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { personalityId: string } }
) {
  try {
    const { personalityId } = params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/random-prompt/${personalityId}`,
      {
        method: "POST",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to start random prompt chat");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting random prompt chat:", error);
    return NextResponse.json(
      { error: "Failed to start random prompt chat" },
      { status: 500 }
    );
  }
}
