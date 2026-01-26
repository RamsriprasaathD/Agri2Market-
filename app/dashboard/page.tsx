import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, type AppRole } from '@/lib/auth';

const roleToDashboard: Record<AppRole, string> = {
  admin: '/dashboard/admin',
  farmer: '/dashboard/farmer',
  buyer: '/dashboard/buyer',
};

export default async function DashboardRedirect() {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);

  if (!user) {
    redirect('/login');
  }

  const destination = roleToDashboard[user.role] ?? '/login';

  redirect(destination);
}
