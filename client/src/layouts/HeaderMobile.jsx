    // src/layouts/HeaderMobile.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./css/Header.css";

export default function HeaderMobile() {
const [open, setOpen] = useState(false);

const close = () => setOpen(false);

return (
    <header className="Container-Header w-full sticky top-0 z-50">
    <nav className="Header-Nav flex items-center justify-between px-4 py-3 text-white">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
        <img src="/logoconty.png" alt="Logo Công ty" className="h-9 w-auto" />     
        </Link>

        <button
        aria-label="Mở menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center justify-center h-10 w-10 rounded-md focus:outline-none focus:ring-2 focus:ring-white/70"
        >
        <span className="sr-only">Toggle menu</span>
        {open ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
        )}
        </button>
    </nav>
    {open && (
        <div
        onClick={close}
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
        />
    )}
    <div
        className={`absolute left-0 right-0 z-50 origin-top transition-all duration-200 ${
        open ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        }`}
    >
        <div className="Header-Nav px-4 pb-4 pt-2 text-white">
        <ul className="flex flex-col gap-3">
            <li><Link to="/" onClick={close}>Trang chủ</Link></li>
            <li><Link to="/du-an" onClick={close}>Dự án</Link></li>
            <li><Link to="/hau-truong" onClick={close}>Hậu trường</Link></li>
        </ul>
        <ul className="mt-3 flex flex-col gap-3">
            <li><Link to="/gioi-thieu" onClick={close}>Giới thiệu</Link></li>
            <li><Link to="/faq" onClick={close}>FAQ</Link></li>
            <li><Link to="/lien-he" onClick={close}>Liên hệ</Link></li>
        </ul>
        </div>
    </div>
    </header>
);
}
