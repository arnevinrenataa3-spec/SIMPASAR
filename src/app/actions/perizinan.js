'use server';

/**
 * @description Thin Server Action adapter for issuing permits.
 * @author Muhamad Hazmi Alfarizqi
 */

import { z } from 'zod';
import { perizinanDbAdapter } from '../../db/adapters/perizinan.js';
import { defineAction } from '../../lib/pipeline.js';
import { terbitkanIzin } from '../../lib/perizinan.js';
import { resolveScope } from '../../lib/scope.js';

const schema = z.object({
  ruangDagangId: z.string().uuid('Ruang Dagang tidak valid.'),
  pasarId: z.string().optional(),
  nik: z.string().trim().regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit.'),
  namaLengkap: z.string().trim().min(2, 'Nama lengkap wajib diisi.'),
  alamat: z.string().trim().min(3, 'Alamat wajib diisi.'),
  nomorHp: z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Nomor HP tidak valid.'),
  nomorKartu: z.string().trim().min(3, 'Nomor kartu wajib diisi.'),
  jenisDagangan: z.string().trim().min(2, 'Jenis dagangan wajib diisi.'),
  tanggalTerbit: z.iso.date('Tanggal terbit tidak valid.'),
  tanggalKedaluwarsa: z.iso.date('Tanggal kedaluwarsa tidak valid.'),
});

const reasons = {
  ruang_tidak_tersedia: 'Ruang Dagang sudah terisi atau berada di luar scope Pasar aktif.',
  tanggal_tidak_valid: 'Tanggal kedaluwarsa harus setelah tanggal terbit.',
};

export const terbitkanIzinAction = defineAction({
  operasi: 'perizinan:ops',
  scope: 'enforce',
  schema,
  revalidate: ['/dashboard/perizinan', '/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data, ctx) => {
    try {
      const activeScope = await resolveScope(ctx.user);
      const pasarId = activeScope === 'all' ? ctx.pasarId : activeScope;
      if (!pasarId) return { error: 'Pilih Ruang Dagang pada sebuah Pasar.' };
      const result = await terbitkanIzin({
        ...data,
        pasarId,
        pedagang: {
          nik: data.nik,
          namaLengkap: data.namaLengkap,
          alamat: data.alamat,
          nomorHp: data.nomorHp,
        },
      }, perizinanDbAdapter);
      if (!result.ok) return { error: reasons[result.reason] ?? 'Izin gagal diterbitkan.' };
      return { message: `Izin ${result.perizinan.nomorKartu} berhasil diterbitkan.` };
    } catch (error) {
      if (error?.code === '23505') return { error: 'NIK atau nomor kartu sudah terdaftar.' };
      throw error;
    }
  },
});
