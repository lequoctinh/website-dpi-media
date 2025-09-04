import React from "react";
import { useMediaQuery } from "react-responsive";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import HeaderMobile from "./HeaderMobile";

export default function Layout() {
const isMobile = useMediaQuery({ maxWidth: 767 });

return (
    <>
    {isMobile ? <HeaderMobile /> : <Header />}
    <main>
        <Outlet />
    </main>
    </>
);
}
