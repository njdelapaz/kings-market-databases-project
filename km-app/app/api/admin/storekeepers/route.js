import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

function badRequest(message) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(request) {
  const role = request.headers.get('x-user-role');
  if (role && role !== 'storekeeper') {
    return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  let connection;
  try {
    const body = await request.json();
    const username = String(body?.username || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const phone = String(body?.phone || '').trim();
    const password = String(body?.password || '');

    if (!username || !email || !phone || !password) {
      return badRequest('All fields are required.');
    }
    if (password.length < 8) {
      return badRequest('Password must be at least 8 characters.');
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [[existingStorekeeperEmail]] = await connection.query(
      'SELECT Email FROM Storekeeper_R1 WHERE Email = ?',
      [email]
    );
    const [[existingStorekeeperUsername]] = await connection.query(
      'SELECT Username FROM Storekeeper_R2 WHERE Username = ?',
      [username]
    );
    const [[existingCustomerEmail]] = await connection.query(
      'SELECT Email FROM Customer_R1 WHERE Email = ?',
      [email]
    );
    const [[existingCustomerUsername]] = await connection.query(
      'SELECT Username FROM Customer_R2 WHERE Username = ?',
      [username]
    );

    if (existingStorekeeperEmail || existingCustomerEmail) {
      return badRequest('An account with that email already exists.');
    }
    if (existingStorekeeperUsername || existingCustomerUsername) {
      return badRequest('That username is already taken.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await connection.query(
      'INSERT INTO Storekeeper_R1 (Email, PhoneNumber) VALUES (?, ?)',
      [email, phone]
    );
    await connection.query(
      'INSERT INTO Storekeeper_R2 (PhoneNumber, Email, Username, PasswordHash) VALUES (?, ?, ?, ?)',
      [phone, email, username, passwordHash]
    );

    await connection.commit();
    return NextResponse.json({ success: true, message: 'Storekeeper account created successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to create storekeeper account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create storekeeper account.' },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
