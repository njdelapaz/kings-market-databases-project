import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const { role, username, email, password } = await request.json();

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

    // If the account has a password hash, verify the supplied password.
    // Accounts seeded before migration 004 have an empty hash; they still work
    // with username+email only until a password is explicitly set.
    if (user.PasswordHash) {
      if (!password) {
        return NextResponse.json(
          { message: 'Password required for this account.' },
          { status: 401 }
        );
      }
      const valid = await bcrypt.compare(password, user.PasswordHash);
      if (!valid) {
        return NextResponse.json({ message: 'Incorrect password.' }, { status: 401 });
      }
    }

    const { PasswordHash: _omit, ...safeUser } = user;
    return NextResponse.json({ success: true, role, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
