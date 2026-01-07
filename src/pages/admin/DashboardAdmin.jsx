// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Progress,
  Alert,
  Timeline,
  Space,
  DatePicker,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  BellOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { getUsers } from "../../services/userService";
import { getServices } from "../../api/service";
import { fetchCourriers } from "../../services/courrierService";

const { RangePicker } = DatePicker;

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalServices: 0,
    courriersToday: 0,
    courriersPending: 0,
    courriersLate: 0,
    completionRate: 0,
  });
  
  const [alerts, setAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("today");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersData, servicesData, courriersData] = await Promise.all([
        getUsers(),
        getServices(),
        fetchCourriers({}),
      ]);

      // Calcul des statistiques
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(user => user.is_active).length;
      const inactiveUsers = totalUsers - activeUsers;
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const courriersToday = courriersData.filter(c => {
        const courrierDate = new Date(c.created_at);
        return courrierDate >= todayStart;
      }).length;

      const courriersPending = courriersData.filter(c => 
        c.statut === 'recu' || c.statut === 'impute' || c.statut === 'traitement'
      ).length;

      const courriersLate = courriersData.filter(c => {
        if (!c.date_echeance) return false;
        const echeanceDate = new Date(c.date_echeance);
        return echeanceDate < now && (c.statut === 'recu' || c.statut === 'impute' || c.statut === 'traitement');
      }).length;

      const courriersCompleted = courriersData.filter(c => 
        c.statut === 'repondu' || c.statut === 'archive'
      ).length;

      const completionRate = courriersData.length > 0 
        ? Math.round((courriersCompleted / courriersData.length) * 100)
        : 0;

      // Génération des alertes
      const generatedAlerts = generateAlerts(courriersLate, usersData, courriersData);
      const recentActivityData = generateRecentActivity(courriersData, usersData);

      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalServices: servicesData.length,
        courriersToday,
        courriersPending,
        courriersLate,
        completionRate,
      });

      setAlerts(generatedAlerts);
      setRecentActivity(recentActivityData.slice(0, 5));
      
    } catch (error) {
      message.error("Erreur lors du chargement des données du dashboard");
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (courriersLate, users, courriers) => {
    const alerts = [];

    if (courriersLate > 0) {
      alerts.push({
        id: 1,
        type: "error",
        title: `${courriersLate} courrier(s) en retard`,
        description: "Des courriers ont dépassé leur date d'échéance",
      });
    }

    const inactiveUsersCount = users.filter(u => !u.is_active).length;
    if (inactiveUsersCount > 0) {
      alerts.push({
        id: 2,
        type: "warning",
        title: `${inactiveUsersCount} utilisateur(s) inactif(s)`,
        description: "Certains comptes utilisateurs sont désactivés",
      });
    }

    const urgentCourriers = courriers.filter(c => c.priorite === 'urgente' && c.statut !== 'repondu');
    if (urgentCourriers.length > 0) {
      alerts.push({
        id: 3,
        type: "error",
        title: `${urgentCourriers.length} courrier(s) urgent(s)`,
        description: "Des courriers urgents nécessitent une attention immédiate",
      });
    }

    return alerts;
  };

  const generateRecentActivity = (courriers, users) => {
    return courriers.slice(0, 10).map(courrier => {
      const user = users.find(u => u.id === courrier.created_by);
      return {
        key: courrier.id,
        type: courrier.type,
        objet: courrier.objet,
        user: user ? `${user.prenom} ${user.nom}` : "Inconnu" ,
        date: new Date(courrier.created_at).toLocaleDateString(),
        status: courrier.statut,
      };
    });
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const columnsActivity = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'entrant' ? 'blue' : type === 'sortant' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Objet',
      dataIndex: 'objet',
      key: 'objet',
      ellipsis: true,
    },
    {
      title: 'Utilisateur',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'repondu' ? 'success' : 
          status === 'traitement' ? 'processing' : 
          status === 'impute' ? 'warning' : 'default'
        }>
          {status}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* En-tête avec filtres */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Tableau de bord 
          </h1>
          <p style={{ color: '#666' }}>Aperçu global du système et alertes</p>
        </div>
        <Space>
          <RangePicker />
          <Button type="primary" onClick={fetchDashboardData}>
            Actualiser
          </Button>
        </Space>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Card title={<><BellOutlined /> Alertes Système</>}>
            {alerts.map(alert => (
              <Alert
                key={alert.id}
                type={alert.type}
                message={alert.title}
                description={alert.description}
                showIcon
                style={{ marginBottom: '8px' }}
              />
            ))}
          </Card>
        </div>
      )}

      {/* Statistiques principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Utilisateurs"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              suffix={
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div style={{ color: '#52c41a' }}>{stats.activeUsers} actifs</div>
                  <div style={{ color: '#ff4d4f' }}>{stats.inactiveUsers} inactifs</div>
                </div>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Services"
              value={stats.totalServices}
              prefix={<HomeOutlined />}
              suffix=""
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Courriers Aujourd'hui"
              value={stats.courriersToday}
              prefix={<RiseOutlined />}
              suffix="nouveaux"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Taux de Traitement"
              value={stats.completionRate}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
            <Progress percent={stats.completionRate} status="active" />
          </Card>
        </Col>
      </Row>

      {/* Statistiques des courriers */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Courriers en attente"
              value={stats.courriersPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Courriers en retard"
              value={stats.courriersLate}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Courriers traités"
              value={stats.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Activité récente et Actions rapides */}
      <Row gutter={[16, 16]}>
  
          <Card 
            title={<><FileTextOutlined /> Activité Récente</>}
            extra={<Button type="link">Voir tout</Button>}
          >
            <Table
              columns={columnsActivity}
              dataSource={recentActivity}
              pagination={{ pageSize: 5 }}
              size="full"
            />
          </Card>
        
      </Row>
    </div>
  );
};

export default DashboardAdmin;