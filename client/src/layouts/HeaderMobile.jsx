// src/layouts/HeaderMobile.jsx
import React, { useEffect, useState } from "react";
import { HashLink } from "react-router-hash-link";
import "./css/Header.css";

// component HashLink có offset giống Header
function CleanHashLink({ to, children, offset = 80, onDone, ...rest }) {
return (
    <HashLink
    to={to}
    smooth
    {...rest}
    scroll={(el) => {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        // xóa hash để không gây nhảy lại khi reload & đóng menu
        setTimeout(() => {
        if (window.location.hash) {
            history.replaceState(null, "", window.location.pathname);
        }
        onDone?.();
        }, 400);
    }}
    >
    {children}
    </HashLink>
);
}

export default function HeaderMobile() {
const [open, setOpen] = useState(false);
const close = () => setOpen(false);

useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
}, [open]);

return (
    <header className="Container-Header w-full sticky top-0 z-50" data-open={open}>
    <nav className="Header-Bar flex items-center justify-between px-4 py-3 text-white">
        <CleanHashLink to="/#trang-chu" onDone={close}>
        <img src="/logoconty.png" alt="Logo Công ty" className="h-9 w-auto" />
        </CleanHashLink>

        <button
        aria-label="Mở menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center justify-center h-10 w-10 rounded-xl ring-1 ring-white/15 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
        >
        {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
        )}
        </button>
    </nav>

    {open && (
        <button aria-label="Đóng menu" onClick={close} className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" />
    )}

    <div
        className={`absolute left-0 right-0 z-50 origin-top transition-all duration-200 ${
        open ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        }`}
    >
        <div className="Header-Panel px-4 pb-4 pt-2 text-white">
        <ul className="flex flex-col gap-3">
            <li><CleanHashLink to="/#du-an" onDone={close}>Dự án</CleanHashLink></li>
            <li><CleanHashLink to="/#hau-truong" onDone={close}>Hậu trường</CleanHashLink></li>
            <li><CleanHashLink to="/#gioi-thieu" onDone={close}>Giới thiệu</CleanHashLink></li>

        </ul>

        <div className="MenuDivider" />

        <ul className="mt-3 flex flex-col gap-3">
            <li><CleanHashLink to="/#faq" onDone={close}>FAQ</CleanHashLink></li>
            <li><CleanHashLink to="/#lien-he" onDone={close}>Liên hệ</CleanHashLink></li>
            <li><CleanHashLink to="/#hoat-dong" onDone={close}>Hoạt động</CleanHashLink></li>
        </ul>
        </div>
    </div>
    </header>
);
}