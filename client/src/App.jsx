import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./layouts";              // layout client
import Home from "./pages/home/Home";
import QuotePage from "./pages/QuotePage";
import NewsDetail from "./pages/news/NewsDetail";
// admin
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import AdminLayout from "./admin/layouts/AdminLayout";
import RequireAdmin from "./admin/components/RequireAdmin";
import AdminBackstage from "./admin/pages/AdminBackstage";
import AdminProjects from "./admin/pages/AdminProjects";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminContacts from "./admin/pages/AdminContacts";
import AdminPosts from "./admin/pages/AdminPosts";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bao-gia" element={<QuotePage />} />
        <Route path="/hoat-dong/:slugOrId" element={<NewsDetail />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="backstage" element={<AdminBackstage/>} />
        <Route path="projects" element={<AdminProjects/>} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="posts" element={<AdminPosts />} />
      </Route>
    </Routes>
  );
}
