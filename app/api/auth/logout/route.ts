import { NextResponse } from 'next/server';

function buildLogoutResponse() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function POST() {
  return buildLogoutResponse();
}

export async function GET() {
  return buildLogoutResponse();
}
