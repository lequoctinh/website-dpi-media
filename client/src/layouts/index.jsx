// src/layouts/index.jsx
import { useMediaQuery } from "react-responsive";
import Header from "./Header";
import HeaderMobile from "./HeaderMobile";
import Footer from "./Footer";

export default function Layout({ children }) {
const isMobile = useMediaQuery({ maxWidth: 767 });

return (
    <>
    {isMobile ? <HeaderMobile /> : <Header />}
    <main className="pt-20"> 
        {children}
    </main>

    <Footer />
    </>
);
}
