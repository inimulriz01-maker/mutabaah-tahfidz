import React, { useState } from 'react';

export default function KonveksiSaliiaApp() {
  const [activeTab, setActiveTab] = useState('beranda');

  // Icon SVG Profesional & Elegan (Clean Line Style)
  const icons = {
    gamis: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4l2 3-3 2v11a2 2 0 01-2 2H9a2 2 0 01-2-2V9L4 7l2-3h4.5a1.5 1.5 0 003 0H16z" />
      </svg>
    ),
    seragam: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M5 7h14l-1 14H6L5 7zm4 4h6m-6 4h6" />
      </svg>
    ),
    kemeja: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 4h-5L7 7l3 3v10h4V10l3-3-2.5-3z" />
      </svg>
    ),
    mukena: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4 21l3.39-.97C8.93 20.63 10.42 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
      </svg>
    ),
    kualitas: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    harga: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    waktu: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const produkList = [
    { nama: "Busana Muslim & Gamis", kategori: "Koleksi Eksklusif", desc: "Produksi gamis, koko, dan busana muslim trendi dengan pilihan bahan premium bertekstur lembut.", icon: icons.gamis },
    { nama: "Seragam Sekolah Berstandar", kategori: "Institusi & Yayasan", desc: "Pembuatan seragam SD, SMP, SMA, dan madrasah dengan potongan rapi, kuat, dan sesuai standar.", icon: icons.seragam },
    { nama: "Kemeja & Jaket Custom", kategori: "Korporat & Komunitas", desc: "Solusi profesional untuk seragam kantor, instansi, event, komunitas, hingga jaket formal.", icon: icons.kemeja },
    { nama: "Gamis Anak & Mukena", kategori: "Perlengkapan Ibadah", desc: "Aneka model mukena bordir eksklusif dan set pakaian ibadah anak yang adem serta nyaman.", icon: icons.mukena }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white">
      
      {/* NAVBAR ELEGAN */}
      <header className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/50">
              <span className="text-cyan-400 font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wide uppercase text-slate-100">Konveksi Saliia</h1>
              <p className="text-[9px] font-semibold tracking-widest text-cyan-400 uppercase">Professional Garment & Production</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 text-xs font-medium">
            {['beranda', 'katalog', 'keunggulan', 'kontak'].map((menu) => (
              <button 
                key={menu}
                onClick={() => setActiveTab(menu)}
                className={`px-5 py-2 rounded-xl capitalize transition-all duration-300 ${
                  activeTab === menu 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {menu}
              </button>
            ))}
          </nav>

          <a href="https://wa.me/" target="_blank" rel="noreferrer" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-950/40 border border-cyan-400/20">
            Hubungi Kami
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-24">

        {/* HERO SECTION */}
        <section className="relative p-8 sm:p-20 rounded-[2.5rem] bg-gradient-to-b from-slate-900/80 to-[#0b0f17] border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col items-center text-center space-y-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-widest uppercase shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Pusat Produksi Konveksi Skala Besar & Butik
          </div>
          
          <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-[1.15] max-w-4xl text-slate-50">
            Kualitas Jahitan Butik, Kapasitas Produksi <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Skala Industri</span>
          </h2>
          
          <p className="text-sm sm:text-base text-slate-400 font-normal max-w-2xl leading-relaxed">
            Spesialis pembuatan busana muslim, seragam sekolah berkualitas tinggi, pakaian kantor, dan konveksi custom dengan ketepatan waktu serta kontrol kualitas ketat di Konveksi Saliia.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-2xl text-xs transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-2">
              Konsultasi & Penawaran Harga 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          </div>
        </section>

        {/* KATALOG PRODUK */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Katalog Unggulan</span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-100">Solusi Produksi Pakaian Kami</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">Dirancang dengan presisi tinggi menggunakan mesin jahit modern untuk hasil jahitan rapi, kuat, dan elegan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produkList.map((item, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
                    {item.icon}
                  </div>
                  <span className="inline-block text-[10px] font-bold text-cyan-400 tracking-wider uppercase">{item.kategori}</span>
                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">{item.nama}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KEUNGGULAN PROFESIONAL */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 flex items-start gap-5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
              {icons.kualitas}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Standar Kualitas Butik</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Setiap produk melalui tahapan Quality Control (QC) ketat sebelum dikirim ke tangan klien.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 flex items-start gap-5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
              {icons.harga}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Harga Kompetitif & Transparan</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Cocok untuk kebutuhan grosir, toko pakaian, reseller, maupun pengadaan instansi resmi.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 flex items-start gap-5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
              {icons.waktu}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Tepat Waktu & Bergaransi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Komitmen tinggi menyelesaikan pesanan sesuai deadline dengan jaminan garansi kerapian.</p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER ELEGAN */}
      <footer className="mt-24 border-t border-slate-800/80 bg-slate-950 py-10 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">S</div>
            <span className="font-bold text-slate-200 tracking-wide">Konveksi Saliia</span>
          </div>
          <p>© 2026 Konveksi Saliia. All Rights Reserved. Professional Garment Solution.</p>
        </div>
      </footer>

    </div>
  );
}