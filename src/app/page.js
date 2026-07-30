/**
 * @description Root page redirector ke /dashboard.
 * @author Muhamad Hazmi Alfarizqi
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
