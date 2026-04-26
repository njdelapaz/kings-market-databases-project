import { NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

const ROUTE_POLICY = [
  { prefix: '/storekeeper',     roles: ['storekeeper'] },
  { prefix: '/customer',        roles: ['customer'] },
  { prefix: '/api/admin',       roles: ['storekeeper'] },
  { prefix: '/api/cart',        roles: ['customer', 'storekeeper'] },
  { prefix: '/api/checkout',    roles: ['customer'] },
  { prefix: '/api/orders',      roles: ['customer', 'storekeeper'] },
  { prefix: '/api/paymentInfo', roles: ['customer'] },
  { prefix: '/api/items',       roles: ['customer', 'storekeeper'] },
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const policy = ROUTE_POLICY.find(r => pathname.startsWith(r.prefix));
  if (!policy) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return redirectToLogin(request);
  }

  if (!policy.roles.includes(payload.role)) {
    const dest = payload.role === 'storekeeper' ? '/storekeeper' : '/customer';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-email',    payload.sub);
  requestHeaders.set('x-user-username', payload.username);
  requestHeaders.set('x-user-role',     payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

function redirectToLogin(request) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/storekeeper/:path*',
    '/api/admin/:path*',
    '/api/cart/:path*',
    '/api/checkout/:path*',
    '/api/orders/:path*',
    '/api/paymentInfo/:path*',
    '/api/items/:path*',
    '/api/items',
  ],
};
