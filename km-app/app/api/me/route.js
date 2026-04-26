import { NextResponse } from 'next/server';

export async function GET(request) {
  const email    = request.headers.get('x-user-email');
  const username = request.headers.get('x-user-username');
  const role     = request.headers.get('x-user-role');

  if (!email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ success: true, email, username, role });
}
