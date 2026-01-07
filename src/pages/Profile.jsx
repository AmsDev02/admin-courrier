// src/pages/Profile.jsx
import React, { useContext } from "react";
import {
  Card,
  Descriptions,
  Row,
  Col,
  Avatar,
  Tag,
  Button,
  Space,
  Divider,
  Timeline
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  SafetyOutlined,
  EditOutlined,
  LockOutlined
} from "@ant-design/icons";
import { AuthContext } from "../contexts/AuthContext";
import RoleBadge from "../components/common/RoleBadge";

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div>Utilisateur non connecté</div>;
  }

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: "Accès complet à toutes les fonctionnalités du système",
      chef: "Gestion des équipes et validation des workflows",
      direction: "Supervision et validation stratégique",
      agent_courrier: "Gestion de la réception et distribution du courrier",
      collaborateur: "Utilisation des fonctionnalités de base"
    };
    return descriptions[role] || "Rôle utilisateur";
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card
            title="Photo de profil"
            extra={<Button type="link" icon={<EditOutlined />}>Modifier</Button>}
          >
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                src={user.photo || "/images.png"}
                icon={!user.photo && <UserOutlined />}
                style={{ 
                  marginBottom: 16,
                  border: '4px solid #f0f0f0'
                }}
              />
              <h3>{user.prenom} {user.nom}</h3>
              <RoleBadge role={user.role} />
            </div>
          </Card>

          <Card title="Sécurité" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<LockOutlined />} block>
                Changer le mot de passe
              </Button>
              <Button icon={<SafetyOutlined />} block>
                Authentification à deux facteurs
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Informations personnelles">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Nom complet" span={2}>
                <b>{user.prenom} {user.nom}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined style={{ marginRight: 8 }} />
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Téléphone">
                <PhoneOutlined style={{ marginRight: 8 }} />
                {user.telephone || "Non renseigné"}
              </Descriptions.Item>
              <Descriptions.Item label="Rôle">
                <RoleBadge role={user.role} />
                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                  {getRoleDescription(user.role)}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                <HomeOutlined style={{ marginRight: 8 }} />
                {user.service?.nom || "Non assigné"}
              </Descriptions.Item>
              <Descriptions.Item label="Date d'inscription">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {new Date(user.date_joined).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Dernière connexion">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {user.last_login ? new Date(user.last_login).toLocaleString() : "Jamais"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Permissions" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item color="green">
                <strong>Courriers</strong>
                <div>Création, consultation, modification</div>
              </Timeline.Item>
              <Timeline.Item color={user.role === 'admin' ? 'green' : 'gray'}>
                <strong>Administration</strong>
                <div>Gestion des utilisateurs et services</div>
              </Timeline.Item>
              <Timeline.Item color={['admin', 'direction'].includes(user.role) ? 'green' : 'gray'}>
                <strong>Rapports</strong>
                <div>Consultation des statistiques avancées</div>
              </Timeline.Item>
              <Timeline.Item color={['admin', 'chef', 'direction'].includes(user.role) ? 'green' : 'gray'}>
                <strong>Workflow</strong>
                <div>Validation et gestion des étapes</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;