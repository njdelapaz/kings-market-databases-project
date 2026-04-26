import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, COOKIE_NAME } from '@/lib/auth';

// Validates uniqueness of email/username, hashes the password, inserts into Customer_R1 and Customer_R2 in a transaction, then issues a JWT cookie.
export async function POST(request) {
  const { username, email, phone, password } = await request.json();

  if (!username || !email || !phone || !password) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: 'Password must be at least 8 characters.' },
      { status: 400 }
    );
  }

  try {
    // Check for existing email in either customer table
    const [[existing]] = await db.query(
      'SELECT Email FROM Customer_R1 WHERE Email = ?',
      [email]
    );
    if (existing) {
      return NextResponse.json({ message: 'An account with that email already exists.' }, { status: 409 });
    }

    // Check for existing username
    const [[existingUser]] = await db.query(
      'SELECT Username FROM Customer_R2 WHERE Username = ?',
      [username]
    );
    if (existingUser) {
      return NextResponse.json({ message: 'That username is already taken.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Insert into both tables inside a transaction
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'INSERT INTO Customer_R1 (Email, PhoneNumber) VALUES (?, ?)',
        [email, phone]
      );
      await conn.query(
        'INSERT INTO Customer_R2 (PhoneNumber, Username, Email, PasswordHash) VALUES (?, ?, ?, ?)',
        [phone, username, email, passwordHash]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const token = await signToken({ sub: email, username, role: 'customer' });

    const response = NextResponse.json(
      { success: true, role: 'customer', user: { Username: username, Email: email } },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
