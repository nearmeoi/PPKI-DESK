import { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { cn } from '../lib/utils';

const ENV_TEMPLATE = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`;

const STEPS = [
  {
    num: 1,
    title: 'Buat Proyek di Supabase',
    desc: 'Daftar gratis di',
    link: { href: 'https://supabase.com', label: 'supabase.com' },
    extra: ', klik New Project, pilih region Singapore untuk latensi terendah.',
  },
  {
    num: 2,
    title: 'Jalankan Skrip SQL',
    desc: 'Di Supabase Dashboard → SQL Editor, salin dan jalankan seluruh isi file',
    code: 'supabase_schema.sql',
    extra: ' dari folder proyek ini.',
  },
  {
    num: 3,
    title: 'Isi file .env',
    desc: 'Buka Project Settings → API, salin URL & Anon Key ke file',
    code: '.env',
    extra: ' di root proyek:',
  },
];

export function SetupSupabaseModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(ENV_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">Setup Database Supabase</h2>
              <p className="text-[10px] text-zinc-400">Free tier PostgreSQL + Realtime</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status badge */}
          <div className={cn(
            'flex items-center gap-3 p-3.5 rounded-2xl border',
            isSupabaseConfigured
              ? 'bg-emerald-950/20 border-emerald-800/40'
              : 'bg-zinc-950 border-zinc-800',
          )}>
            <span className={cn(
              'w-3 h-3 rounded-full flex-shrink-0',
              isSupabaseConfigured ? 'bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.3)]' : 'bg-amber-500',
            )} />
            <div>
              <p className="text-xs font-semibold text-zinc-100">
                {isSupabaseConfigured ? 'Terhubung ke Supabase' : 'Mode LocalStorage (Aktif)'}
              </p>
              <p className="text-[10px] text-zinc-500">
                {isSupabaseConfigured
                  ? 'Perubahan tersinkronisasi antar perangkat secara realtime.'
                  : 'Semua data tersimpan di browser. Ikuti langkah di bawah untuk terhubung ke Supabase.'}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-3 p-3.5 bg-zinc-950 border border-zinc-800/60 rounded-2xl">
                <span className="w-6 h-6 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.num}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-100 mb-0.5">{step.title}</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {step.desc}
                    {step.link && (
                      <a href={step.link.href} target="_blank" rel="noreferrer"
                        className="text-indigo-400 inline-flex items-center gap-0.5 hover:text-indigo-300 underline underline-offset-2 mx-0.5">
                        {step.link.label} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {step.code && <code className="text-indigo-300 font-mono text-[10px] mx-0.5 bg-indigo-950/40 px-1.5 py-0.5 rounded">{step.code}</code>}
                    {step.extra}
                  </p>
                  {step.num === 3 && (
                    <div className="relative mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <pre className="text-[10px] text-zinc-300 font-mono p-3 overflow-x-auto">{ENV_TEMPLATE}</pre>
                      <button
                        onClick={copy}
                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors active:scale-95">
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
