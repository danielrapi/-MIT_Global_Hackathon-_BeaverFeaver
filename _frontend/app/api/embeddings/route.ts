import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("req", req)
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  console.log("AMK", text)
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    console.log("response", response.data[0].embedding)
    return NextResponse.json({ embedding: response.data[0].embedding });
  } catch (error) {
    return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
  }
}