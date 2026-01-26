import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  ensureAdminUser,
  generateToken,
  recordLogin,
  type AppRole,
  type AuthPayload,
} from '@/lib/auth';
import { logActivity, USER_LOGIN_ACTIVITY } from '@/lib/activity';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminUser();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const role = user.role.toLowerCase() as AppRole;

    const authPayload: AuthPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    };

    const { lastLoginAt, lastLoginAtIST } = await recordLogin(user.id);

    const token = generateToken(authPayload);

    await logActivity({
      userId: user.id,
      type: USER_LOGIN_ACTIVITY,
      description: 'User logged in',
      metadata: {
        userAgent: request.headers.get('user-agent') ?? 'unknown',
      },
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          ...user,
          role,
          lastLoginAt,
          lastLoginAtIST,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
