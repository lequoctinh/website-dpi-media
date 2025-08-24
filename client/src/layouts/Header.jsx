import React from "react";
import { Link } from "react-router-dom";
import './css/Header.css';

function Header() {
return (
<header className="Container-Header w-full shadow-md sticky top-0 z-50">
    <nav className="Header-Nav flex items-center justify-center px-8 py-4 gap-12">
            {/* Menu trái */}
            <ul className="flex items-center gap-6">
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/du-an">Dự án</Link></li>
                <li><Link to="/hau-truong">Hậu trường</Link></li>
            </ul>

            {/* Logo giữa */}
            <div className="flex-shrink-0">
                <Link to="/">
                <img src="/logoconty.png" alt="Logo Công ty" className="h-12 w-auto" />
                </Link>
            </div>

            {/* Menu phải */}
            <ul className="flex items-center gap-6">
                <li><Link to="/gioi-thieu">Giới thiệu</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/lien-he">Liên hệ</Link></li>
            </ul>
        </nav>

</header>
);
}

export default Header;
