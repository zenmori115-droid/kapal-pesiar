import React from 'react';
import { Anchor, Award, Printer, X } from 'lucide-react';
import { CertificateRecord } from '../types/academy';
import { ShareActions } from './ui/CommonUI';

interface CertificateModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const formattedDate = new Date(certificate.completedDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shareText = `Saya baru saja menyelesaikan seluruh modul dan lulus Ujian Akhir Divisi ${certificate.divisionName} dengan skor ${certificate.finalExamScore}% di CruiseCrew Academy! (Kode: ${certificate.certificateCode})`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030715]/88 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Sertifikat Penyelesaian"
    >
      <div className="w-full max-w-4xl space-y-4 my-auto">
        {/* Top Controls (Hidden on Print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <ShareActions shareText={shareText} label="Bagikan ke" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup sertifikat"
              className="h-11 w-11 rounded-xl bg-[#0D1B4A] border border-[#5A96FF]/35 flex items-center justify-center text-[#A9B8DB] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Luxury Maritime Certificate */}
        <div className="print-certificate-only rounded-2xl p-2 bg-gradient-to-br from-[#2F6BFF]/70 via-[#FFA24D]/70 to-[#2F6BFF]/70 shadow-[0_0_50px_rgba(47,107,255,0.4)]">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#06102B] via-[#0B1942] to-[#081333] p-8 sm:p-12 border border-[#FFA24D]/35 text-center">
            {/* Subtle Corner Accents */}
            <div className="pointer-events-none absolute top-4 left-4 h-12 w-12 border-t-2 border-l-2 border-[#FFA24D]/55 rounded-tl-lg" />
            <div className="pointer-events-none absolute top-4 right-4 h-12 w-12 border-t-2 border-r-2 border-[#FFA24D]/55 rounded-tr-lg" />
            <div className="pointer-events-none absolute bottom-4 left-4 h-12 w-12 border-b-2 border-l-2 border-[#FFA24D]/55 rounded-bl-lg" />
            <div className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-[#FFA24D]/55 rounded-br-lg" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2F6BFF] to-[#FF7A1A] flex items-center justify-center text-white shadow-[0_0_24px_rgba(255,122,26,0.45)]">
                  <Anchor className="w-7 h-7" />
                </div>
                <p className="font-display text-sm font-bold tracking-wider text-[#FFA24D]">
                  CRUISECREW ACADEMY
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F4F7FF] tracking-tight">
                  Sertifikat Penyelesaian
                </h2>
                <p className="text-sm text-[#A9B8DB]">Diberikan dengan bangga kepada</p>
              </div>

              <div className="py-2 border-y border-[#5A96FF]/25">
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#FFA24D]">
                  {certificate.userName}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base text-[#D7E2FA] leading-relaxed">
                  Telah menyelesaikan seluruh modul pembelajaran dan dinyatakan lulus Ujian Akhir Divisi
                </p>
                <p className="font-display text-xl sm:text-2xl font-bold text-[#F4F7FF]">
                  {certificate.divisionName}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="rounded-xl bg-[#0A1638]/80 border border-[#5A96FF]/25 p-3.5">
                  <p className="text-xs text-[#A9B8DB]">Skor Ujian Akhir</p>
                  <p className="mt-1 font-display text-xl font-bold text-[#34D399] tabular-nums">
                    {certificate.finalExamScore}%
                  </p>
                </div>
                <div className="rounded-xl bg-[#0A1638]/80 border border-[#5A96FF]/25 p-3.5">
                  <p className="text-xs text-[#A9B8DB]">Tanggal Kelulusan</p>
                  <p className="mt-1 font-display text-sm sm:text-base font-bold text-[#F4F7FF]">
                    {formattedDate}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0A1638]/80 border border-[#5A96FF]/25 p-3.5">
                  <p className="text-xs text-[#A9B8DB]">Kode Internal</p>
                  <p className="mt-1 font-mono text-sm font-bold text-[#5AA2FF] tabular-nums">
                    {certificate.certificateCode}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#A9B8DB]">
                <Award className="w-4 h-4 text-[#FFA24D] shrink-0" />
                <span>
                  Sertifikat ini hanya penanda belajar internal aplikasi, bukan sertifikasi resmi pelayaran.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
