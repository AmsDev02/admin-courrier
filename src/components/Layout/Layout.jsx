// src/components/Layout/Layout.jsx
import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthContext } from "../../contexts/AuthContext";
// import { AuthContext } from '../../contexts/AuthContext';
// import { useContext } from 'react';

import { Layout as AntLayout } from "antd";

const { Content } = AntLayout;

const LayoutApp = () => {
  const { user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {/* Sidebar collapsable */}
      <Sidebar collapsed={collapsed} userRole={user?.role} />

      <AntLayout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: "all 0.2s ease",
          minHeight: "100vh",
        }}
      >
        {/* Header avec bouton toggle et profil */}
        <Header 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          user={user} 
        />

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
            marginTop: 64, // Compense le header fixe
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default LayoutApp;