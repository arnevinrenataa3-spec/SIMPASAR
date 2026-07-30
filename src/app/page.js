/**
 * @description Halaman akar yang langsung mengarahkan pengguna ke dashboard.
 * @author Muhamad Hazmi Alfarizqi
 */

import { redirect } from 'next/navigation';

export default function Home() {
  // redirect menghentikan render Server Component ini dan mengirim respons pengalihan.
  redirect('/dashboard');
}
