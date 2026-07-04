import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
