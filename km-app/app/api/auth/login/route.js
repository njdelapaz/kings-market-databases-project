import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, COOKIE_NAME } from '@/lib/auth';

// Looks up the user by role/username/email, verifies the bcrypt password, and sets an httpOnly JWT cookie on success.
export async function POST(request) {
  const { role, username, email, password } = await request.json();

  if (!role || !username || !email || !password) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  try {
    let rows;

    if (role === 'customer') {
      [rows] = await db.query(
        `SELECT Username, Email, PasswordHash
         FROM Customer_R2
         WHERE Username = ? AND Email = ?`,
        [username, email]
      );
    } else if (role === 'storekeeper') {
      [rows] = await db.query(
        `SELECT Username, Email, PasswordHash
         FROM Storekeeper_R2
         WHERE Username = ? AND Email = ?`,
        [username, email]
      );
    } else {
      return NextResponse.json({ message: 'Invalid role.' }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'No account found with those details.' },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (!user.PasswordHash) {
      return NextResponse.json(
        { message: 'Account has no password set. Contact an admin.' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) {
      return NextResponse.json({ message: 'Incorrect password.' }, { status: 401 });
    }

    const token = await signToken({ sub: email, username, role });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PasswordHash: _omit, ...safeUser } = user;
    const response = NextResponse.json({ success: true, role, user: safeUser });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
