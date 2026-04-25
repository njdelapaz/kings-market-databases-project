import { NextResponse } from 'next/server';
import db from '@/lib/db';

function isValidPhone(phone) {
  return typeof phone === 'string' && /^[0-9+()\-\s]{7,20}$/.test(phone.trim());
}

export async function GET(request) {
  const email = request.headers.get('x-user-email');

  if (!email) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const [rows] = await db.query(
      `SELECT Email, PhoneNumber, Username
       FROM v_customer_profile
       WHERE Email = ?`,
      [email]
    );

    if (!rows.length) {
      return NextResponse.json({ success: false, message: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: rows[0] });
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const email = request.headers.get('x-user-email');

  if (!email) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const nextUsername = typeof body.username === 'string' ? body.username.trim() : undefined;
  const nextPhone    = typeof body.phone    === 'string' ? body.phone.trim()    : undefined;

  if (nextUsername === undefined && nextPhone === undefined) {
    return NextResponse.json(
      { success: false, message: 'At least one field is required: username or phone.' },
      { status: 400 }
    );
  }

  if (nextUsername !== undefined && nextUsername.length < 2) {
    return NextResponse.json(
      { success: false, message: 'Username must be at least 2 characters.' },
      { status: 400 }
    );
  }

  if (nextPhone !== undefined && !isValidPhone(nextPhone)) {
    return NextResponse.json(
      { success: false, message: 'Phone format is invalid.' },
      { status: 400 }
    );
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      `SELECT r1.Email, r1.PhoneNumber, r2.Username
       FROM Customer_R1 r1
       JOIN Customer_R2 r2 ON r2.Email = r1.Email
       WHERE r1.Email = ?`,
      [email]
    );

    if (!existing.length) {
      await conn.rollback();
      return NextResponse.json({ success: false, message: 'Profile not found.' }, { status: 404 });
    }

    if (nextUsername !== undefined) {
      const [taken] = await conn.query(
        `SELECT 1 FROM Customer_R2 WHERE Username = ? AND Email <> ? LIMIT 1`,
        [nextUsername, email]
      );
      if (taken.length) {
        await conn.rollback();
        return NextResponse.json(
          { success: false, message: 'That username is already taken.' },
          { status: 409 }
        );
      }
    }

    if (nextPhone !== undefined) {
      const [taken] = await conn.query(
        `SELECT 1 FROM Customer_R1 WHERE PhoneNumber = ? AND Email <> ? LIMIT 1`,
        [nextPhone, email]
      );
      if (taken.length) {
        await conn.rollback();
        return NextResponse.json(
          { success: false, message: 'That phone number is already in use.' },
          { status: 409 }
        );
      }
    }

    if (nextPhone !== undefined) {
      await conn.query(
        `UPDATE Customer_R1 SET PhoneNumber = ? WHERE Email = ?`,
        [nextPhone, email]
      );
      await conn.query(
        `UPDATE Customer_R2 SET PhoneNumber = ? WHERE Email = ?`,
        [nextPhone, email]
      );
    }

    if (nextUsername !== undefined) {
      await conn.query(
        `UPDATE Customer_R2 SET Username = ? WHERE Email = ?`,
        [nextUsername, email]
      );
    }

    await conn.commit();

    const [rows] = await conn.query(
      `SELECT Email, PhoneNumber, Username FROM v_customer_profile WHERE Email = ?`,
      [email]
    );

    return NextResponse.json({ success: true, profile: rows[0] });
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore rollback error */ }
    console.error('Profile PATCH error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
