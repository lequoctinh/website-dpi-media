import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layouts";
import Home from "./pages/home/Home";
export default function App() {
  return (
    <Layout>
      <Routes>
          <Route path="/" element={<Home />} />
      </Routes>
    </Layout>
  );
}
