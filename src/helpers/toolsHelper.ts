import Swal from 'sweetalert2'

export async function showSuccessDialog(message: string, title = 'Berhasil'): Promise<void> {
  await Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#4f46e5',
    timer: 2200,
    timerProgressBar: true,
  })
}

export async function showErrorDialog(message: string, title = 'Terjadi Kesalahan'): Promise<void> {
  await Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#4f46e5',
  })
}

/** Menampilkan dialog konfirmasi; mengembalikan true bila pengguna menekan tombol konfirmasi. */
export async function showConfirmDialog(
  text: string,
  confirmText = 'Ya, lanjutkan',
  title = 'Apakah Anda yakin?',
): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  })
  return result.isConfirmed
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number | string): string {
  return rupiahFormatter.format(Number(value) || 0)
}

function parseDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string): string {
  const date = parseDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date)
}

export function formatDateTime(value: string): string {
  const date = parseDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}
