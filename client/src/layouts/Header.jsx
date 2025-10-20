import React, { useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import "./css/Header.css";
import { Link } from "react-router-dom";
function CleanHashLink({ to, children, offset = 80, ...rest }) {
return (
    <HashLink
    to={to}
    smooth
    {...rest}
    scroll={(el) => {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        setTimeout(() => {
        if (window.location.hash) {
            history.replaceState(null, "", window.location.pathname);
        }
        }, 400);
    }}
    >
    {children}
    </HashLink>
);
}

export default function Header() {
useEffect(() => {
    const onScroll = () => {
    if (window.scrollY > 50) {
        document.body.classList.add("scrolled");
    } else {
        document.body.classList.remove("scrolled");
    }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
}, []);

const HEADER_OFFSET = 80;

return (
    <header className="Container-Header w-full z-50">
    <nav className="Header-Nav flex items-center justify-center px-8 py-4 gap-12">
        <ul className="flex items-center gap-6">
        <li><CleanHashLink to="/#du-an" offset={HEADER_OFFSET}>Dự án</CleanHashLink></li>
        <li><CleanHashLink to="/#hau-truong" offset={HEADER_OFFSET}>Hậu trường</CleanHashLink></li>
        <li><CleanHashLink to="/#gioi-thieu" offset={HEADER_OFFSET}>Giới thiệu</CleanHashLink></li>
        </ul>

        <div className="flex-shrink-0">
        <CleanHashLink to="/#trang-chu" offset={HEADER_OFFSET}>
            <img src="/logoconty.png" alt="Logo Công ty" className="h-12 w-auto" />
        </CleanHashLink>
        </div>

        <div className="flex items-center gap-4">
        <ul className="flex items-center gap-6">
            <li><CleanHashLink to="/#hoat-dong" offset={HEADER_OFFSET}>Hoạt động</CleanHashLink></li>
            <li><CleanHashLink to="/#faq" offset={HEADER_OFFSET}>FAQ</CleanHashLink></li>
            <li><CleanHashLink to="/#lien-he" offset={HEADER_OFFSET}>Liên hệ</CleanHashLink></li>
        </ul>
        </div>
    </nav>
    </header>
);
}
