/**
 * @description Utilitas autentikasi untuk menandatangani, membaca, dan menghapus cookie sesi.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pasar, users } from '../db/schema.js';
import { hashPassword, verifyPassword } from './password.js';

export { hashPassword, verifyPassword };

const SESSION_COOKIE_NAME = 'simpasar_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'simpasar-secret-key-2026-v1';

function signSession(payload) {
  // HMAC menjamin isi sesi tidak diubah klien; data ditandatangani, bukan dienkripsi.
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, hmac })).toString('base64url');
}

function verifySessionToken(token) {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const { data, hmac } = JSON.parse(raw);
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');

    const hmacBuf = Buffer.from(hmac);
    const expectedBuf = Buffer.from(expectedHmac);

    // Perbandingan waktu-konstan mengurangi kebocoran informasi melalui durasi pemeriksaan signature.
    if (hmacBuf.length === expectedBuf.length && crypto.timingSafeEqual(hmacBuf, expectedBuf)) {
      const payload = JSON.parse(data);
      if (payload.exp && Date.now() > payload.exp) {
        return null;
      }
      return payload;
    }
  } catch (err) {
    return null;
  }
  return null;
}

export async function createSession(userId) {
  // Sesi berlaku tujuh hari dan cookie httpOnly tidak dapat dibaca JavaScript di browser.
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signSession({ userId, exp });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !payload.userId) return null;

  try {
    // Data user selalu dibaca ulang dari database agar role/pasar terbaru langsung berlaku.
    const userRecords = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role,
        pasarId: users.pasarId,
        pasarNama: pasar.namaPasar,
      })
      .from(users)
      .leftJoin(pasar, eq(users.pasarId, pasar.id))
      .where(eq(users.id, payload.userId));

    if (!userRecords.length) {
      return null;
    }

    return userRecords[0];
  } catch (err) {
    console.error('Error fetching session user:', err);
    return null;
  }
}
