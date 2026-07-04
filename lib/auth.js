import { cookies } from 'next/headers';
import db from './db';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) return null;

  const session = db.getSession(sessionId);
  if (!session) return null;

  const users = db.getUsers();
  const user = users.find(u => u.employeeId === session.employeeId);
  if (!user) return null;

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
