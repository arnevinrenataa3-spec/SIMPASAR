/**
 * @file src/app/page.js
 * @description Root page redirector ke /dashboard.
 * @author Aditya Syahestiano
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
