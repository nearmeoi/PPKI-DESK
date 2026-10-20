import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SetupSupabaseModalProps {
  onClose: () => void;
}

export const SetupSupabaseModal: React.FC<SetupSupabaseModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const envSample = `# Konfigurasi Supabase Anda (di file .env)
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Koneksi Database Supabase (Free Tier)
              </h2>
              <p className="text-[11px] text-zinc-400">
                Setup database gratis PostgreSQL + Realtime untuk PPKI Progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-amber-500 ring-4 ring-amber-500/20'
                }`}
              />
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  {isSupabaseConfigured
                    ? 'Tersambung ke Supabase Cloud'
                    : 'Mode Penyimpanan Lokal (Aktif)'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {isSupabaseConfigured
                    ? 'Data otomatis tersinkronisasi antar anggota secara realtime.'
                    : 'Aplikasi berjalan lancar dengan penyimpanan browser lokal (LocalStorage).'}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Step Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Langkah Menghubungkan Supabase Gratis:
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex gap-2.5 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-indigo-800">
                  1
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">Buat Proyek Baru di Supabase</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>, buat akun gratis dan klik <em>New Project</em> (pilih region terdekat: Singapore).
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-indigo-800">
                  2
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">Eksekusi Skrip SQL</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Buka menu <strong>SQL Editor</strong> di dashboard Supabase, lalu copy & paste isi file <code className="text-indigo-300 font-mono text-[10px]">supabase_schema.sql</code> yang sudah kami sediakan di folder proyek ini.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 border border-indigo-800">
                  3
                </span>
                <div className="w-full">
                  <p className="font-semibold text-zinc-100">Salin Kunci API ke file .env</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 mb-2">
                    Buka <strong>Project Settings &gt; API</strong>, salin URL dan anon key Anda ke file <code className="text-indigo-300 font-mono text-[10px]">.env</code>:
                  </p>

                  <div className="relative bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto">
                    <pre>{envSample}</pre>
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-2 top-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center gap-1 text-[10px]"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
