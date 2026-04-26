import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

// Clears the auth cookie by setting it to empty with maxAge=0, effectively logging the user out.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return response;
}
