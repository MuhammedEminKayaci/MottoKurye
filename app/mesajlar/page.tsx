import React from "react";

export default function MessagesIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-b from-orange-50/50 to-white">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Mesajlarınız</h2>
        <p className="text-neutral-500 max-w-md leading-relaxed">
          Sol taraftaki listeden bir sohbet seçerek görüntüleyebilirsiniz.
        </p>
        <p className="text-neutral-400 text-sm mt-3">
          Yeni bir mesaj göndermek için ilan detay sayfalarını kullanabilirsiniz.
        </p>
        
        {/* Quick tips */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 bg-white rounded-full text-sm text-neutral-600 shadow-sm border border-neutral-100">
            💬 Hızlı yanıt verin
          </span>
          <span className="px-4 py-2 bg-white rounded-full text-sm text-neutral-600 shadow-sm border border-neutral-100">
            ✨ Profesyonel olun
          </span>
        </div>
      </div>
    </div>
  );
}
