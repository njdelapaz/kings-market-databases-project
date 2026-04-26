import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyToken } from '@/lib/auth';
import { proxy as middleware } from '../proxy.js';
import { NextResponse } from 'next/server';

vi.mock('@/lib/auth', () => ({
  COOKIE_NAME: 'km_token',
  verifyToken: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn((opts) => ({ _type: 'next', opts })),
    redirect: vi.fn((url) => ({ _type: 'redirect', url })),
  },
}));

function makeRequest(pathname, token = null) {
  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name) => (name === 'km_token' && token ? { value: token } : undefined),
    },
    headers: new Headers(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('unprotected routes', () => {
  it('passes through without auth check', async () => {
    await middleware(makeRequest('/login'));
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('passes through public item listing', async () => {
    await middleware(makeRequest('/'));
    expect(NextResponse.next).toHaveBeenCalled();
  });
});

describe('unauthenticated requests', () => {
  it('redirects to login on customer route with no token', async () => {
    await middleware(makeRequest('/customer/dashboard'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/customer/dashboard');
  });

  it('redirects to login on storekeeper route with no token', async () => {
    await middleware(makeRequest('/storekeeper/inventory'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/login');
  });

  it('redirects to login on api/cart with no token', async () => {
    await middleware(makeRequest('/api/cart'));
    expect(NextResponse.redirect).toHaveBeenCalled();
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/login');
  });

  it('redirects to login on api/admin with no token', async () => {
    await middleware(makeRequest('/api/admin/items'));
    expect(NextResponse.redirect).toHaveBeenCalled();
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/login');
  });

  it('redirects to login when token fails verification', async () => {
    verifyToken.mockRejectedValue(new Error('invalid'));
    await middleware(makeRequest('/customer/orders', 'bad-token'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/login');
  });
});

describe('role mismatch', () => {
  it('redirects customer away from storekeeper route', async () => {
    verifyToken.mockResolvedValue({ sub: 'c@test.com', role: 'customer', username: 'c1' });
    await middleware(makeRequest('/storekeeper/dashboard', 'tok'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/customer');
  });

  it('redirects storekeeper away from customer route', async () => {
    verifyToken.mockResolvedValue({ sub: 'sk@test.com', role: 'storekeeper', username: 'sk1' });
    await middleware(makeRequest('/customer/orders', 'tok'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/storekeeper');
  });

  it('redirects customer away from api/admin', async () => {
    verifyToken.mockResolvedValue({ sub: 'c@test.com', role: 'customer', username: 'c1' });
    await middleware(makeRequest('/api/admin/items', 'tok'));
    expect(NextResponse.redirect).toHaveBeenCalled();
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.pathname).toBe('/customer');
  });
});

describe('authenticated access allowed', () => {
  it('allows customer to reach customer routes', async () => {
    verifyToken.mockResolvedValue({ sub: 'c@test.com', role: 'customer', username: 'c1' });
    await middleware(makeRequest('/customer/dashboard', 'tok'));
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('allows storekeeper to reach storekeeper routes', async () => {
    verifyToken.mockResolvedValue({ sub: 'sk@test.com', role: 'storekeeper', username: 'sk1' });
    await middleware(makeRequest('/storekeeper/inventory', 'tok'));
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('allows storekeeper to reach api/admin', async () => {
    verifyToken.mockResolvedValue({ sub: 'sk@test.com', role: 'storekeeper', username: 'sk1' });
    await middleware(makeRequest('/api/admin/items', 'tok'));
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('attaches trusted identity headers on success', async () => {
    verifyToken.mockResolvedValue({ sub: 'c@test.com', role: 'customer', username: 'cust1' });
    await middleware(makeRequest('/api/cart', 'tok'));
    const opts = NextResponse.next.mock.calls[0][0];
    expect(opts.request.headers.get('x-user-email')).toBe('c@test.com');
    expect(opts.request.headers.get('x-user-role')).toBe('customer');
    expect(opts.request.headers.get('x-user-username')).toBe('cust1');
  });
});

describe('redirect behavior on protected pages', () => {
  it('includes the attempted path in the login redirect next param', async () => {
    await middleware(makeRequest('/customer/profile'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.searchParams.get('next')).toBe('/customer/profile');
  });

  it('includes api path in login redirect next param', async () => {
    await middleware(makeRequest('/api/checkout'));
    const url = NextResponse.redirect.mock.calls[0][0];
    expect(url.searchParams.get('next')).toBe('/api/checkout');
  });
});
