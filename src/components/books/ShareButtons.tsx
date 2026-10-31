"use client";

import { useState } from "react";
import { MessageCircle, Send, Link } from "lucide-react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const full = typeof window !== "undefined" ? window.location.origin + url : url;

  function copy() {
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">Bagikan:</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(title + " " + full)}`} target="_blank" rel="noreferrer" className="rounded-full p-2 text-green-600 hover:bg-green-50" aria-label="WhatsApp"><MessageCircle size={18} /></a>
      <a href={`https://t.me/share/url?url=${encodeURIComponent(full)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noreferrer" className="rounded-full p-2 text-blue-500 hover:bg-blue-50" aria-label="Telegram"><Send size={18} /></a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(full)}`} target="_blank" rel="noreferrer" className="rounded-full p-2 text-blue-700 hover:bg-blue-50" aria-label="Facebook"><svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.9c0-.9.3-1.5 1.600-1.500h1.600V3.500C16.400 3.400 15.500 3.300 14.400 3.300c-2.300 0-3.900 1.400-3.900 4v2.500H7.800V13h2.700v8z"/></svg></a>
      <button onClick={copy} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Salin tautan"><Link size={18} /></button>
      {copied ? <span className="text-xs text-green-600">Tersalin!</span> : null}
    </div>
  );
}
