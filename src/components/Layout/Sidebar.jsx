import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  InboxOutlined,
  SendOutlined,
  SwapOutlined,
  RobotOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  BarChartOutlined,
  HomeOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = ({ userRole, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  /**
   * Permissions par rôle
   */
  const rolePermissions = {
    admin: [
      "dashboard",
      "courriers",
      "workflow",
      "ia",
      "archives",
      "services",
      "reports",
      "administration",
    ],
    chef_service: ["dashboard", "courriers", "workflow", "ia"],
    direction: ["dashboard", "courriers", "workflow", "ia", "reports", "archives"],
    collaborateurs: ["dashboard", "courriers"],
    agent_courrier: ["dashboard", "courriers", "workflow", "ia"],
  };

  /**
   * Menu principal structuré par catégories
   */
  const menuStructure = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      path: "/",
    },
    {
      key: "courriers",
      label: "Gestion des Courriers",
      icon: <InboxOutlined />,
      children: [
        { key: "/courriers-entrants", label: "Courriers Entrants", icon: <InboxOutlined /> },
        { key: "/courriers-sortants", label: "Courriers Sortants", icon: <SendOutlined /> },
        { key: "/archives", label: "Archives", icon: <FolderOpenOutlined /> },
      ],
    },
    {
      key: "workflow",
      label: "Workflow",
      icon: <SwapOutlined />,
      path: "/workflow",
    },
    {
      key: "ia",
      label: "IA & Automatisation",
      icon: <RobotOutlined />,
      path: "/ia",
    },
    {
      key: "reports",
      label: "Rapports & Statistiques",
      icon: <BarChartOutlined />,
      path: "/reports",
    },
    // {
    //   key: "services",
    //   label: "Services",
    //   icon: <HomeOutlined />,
    //   path: "/services",
    // },
    {
      key: "administration",
      label: "Administration",
      icon: <SettingOutlined />,
      children: [
        { key: "/administration", label: "Utilisateurs", icon: <TeamOutlined /> },
        { key: "/services-admin", label: "Services", icon: <HomeOutlined /> },
        { key: "/categories", label: "Catégories", icon: <AppstoreOutlined /> },
        { key: "/rules", label: "Règles IA", icon: <RobotOutlined /> },
      ],
    },
  ];

  /**
   * ➤ Filtrer selon les permissions du rôle
   */
  const allowedMenu = menuStructure.filter((item) =>
    rolePermissions[userRole]?.includes(item.key)
  );

  /**
   * ➤ Transformer en format Ant Design
   */
  const buildMenuItems = (items) =>
    items.map((item) => {
      if (item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children.map((child) => ({
            key: child.key,
            label: child.label,
            icon: child.icon,
            onClick: () => navigate(child.key),
          })),
        };
      }

      return {
        key: item.path,
        icon: item.icon,
        label: item.label,
        onClick: () => navigate(item.path),
      };
    });

  const items = buildMenuItems(allowedMenu);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div
        className="logo"
        style={{
          height: 70,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          paddingLeft: collapsed ? 0 : 20,
          fontWeight: "bold",
          fontSize: collapsed ? 20 : 24,
          background: "rgba(255, 255, 255, 0.05)",
        }}
      >
        {collapsed ? "MY📧" : "MyCourrier"}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        items={items}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={["courriers", "administration"]}
      />
    </Sider>
  );
};

export default Sidebar;
