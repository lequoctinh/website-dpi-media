import React from "react";
import BannerHome from "./components/BannerHome";
import ShowReels from "./components/ShowReels";
import Partner from "./components/Partner";
import Project from "./components/Project";
import Backstage from "./components/Backstage";
import About from "./components/About";
import Faq from "./components/Faq";
import Contact from "./components/Contact";
export default function Home() {
return (
    <>
    <section id="trang-chu">
        <BannerHome />
    </section>
        <ShowReels />
        <Partner />
    
    <section id="du-an">
        <Project/>
    </section>
    <section id="hau-truong">
        <Backstage/>
    </section>
    <section id="gioi-thieu">
        <About/>
    </section>
    <section id="faq">
        <Faq/>
    </section>
    <section id="lien-he">
        <Contact/>
    </section>
    </>
);
}
