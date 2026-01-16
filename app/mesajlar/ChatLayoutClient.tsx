"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface ChatLayoutClientProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function ChatLayoutClient({ children, sidebar }: ChatLayoutClientProps) {
  const pathname = usePathname();
  // Check if we are on a specific chat page (e.g. /mesajlar/uuid)
  // Base path is /mesajlar. If length > 2 parts after split, or checking existence of ID.
  const isDetailPage = pathname.startsWith("/mesajlar/") && pathname.split("/").length > 2;

  return (
    <div className="flex h-full w-full bg-neutral-50 overflow-hidden">
       {/* 
          Sidebar:
          - Mobile: Full screen if NOT detail page
          - Desktop: Fixed 320px/360px width sidebar
       */}
       <div className={`
          ${isDetailPage ? 'hidden md:flex' : 'flex'} 
          w-full md:w-80 lg:w-[360px] h-full bg-white md:border-r md:border-neutral-200 flex-shrink-0 z-20 md:shadow-sm
        `}>
          {sidebar}
       </div>

       {/* 
          Main Content (Children):
          - Mobile: Full screen if IS detail page
          - Desktop: Fills remaining space
       */}
       <div className={`
          ${isDetailPage ? 'flex' : 'hidden md:flex'} 
          flex-1 h-full bg-white md:bg-neutral-50 relative z-10 min-w-0 flex-col
       `}>
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-100">
            <div>
              <h2 className="font-bold text-lg text-neutral-800">Sohbet</h2>
              <p className="text-sm text-neutral-500">Mesajlaşmaya devam edin</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {children}
          </div>
       </div>
    </div>
  );
}
