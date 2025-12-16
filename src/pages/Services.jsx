// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  notification,
  Card,
  Row,
  Col,
  Breadcrumb,
} from "antd";

import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getServices, createService, updateService, deleteService } from "../api/service";
import { getUsers } from "../api/auth";

const { Option } = Select;

const Services = () => {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();

  const [filterName, setFilterName] = useState("");
  const [filterChef, setFilterChef] = useState(null);

  // ------------------ Fetch services & users ------------------
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      notification.error({ message: "Erreur", description: "Impossible de récupérer les services" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchUsersList();
  }, []);

  // ------------------ Filters ------------------
  const filteredServices = services.filter((s) => {
    const matchName = s.nom.toLowerCase().includes(filterName.toLowerCase());
    const matchChef = filterChef ? s.chef?.id === filterChef : true;
    return matchName && matchChef;
  });

  const resetFilters = () => {
    setFilterName("");
    setFilterChef(null);
  };

  // ------------------ CRUD ------------------
  const handleAdd = async (values) => {
    try {
      await createService(values);
      notification.success({ message: "Service créé" });
      setOpenAdd(false);
      form.resetFields();
      fetchServices();
    } catch (err) {
      notification.error({ message: "Erreur", description: "Impossible de créer le service" });
    }
  };

  const handleEdit = async (values) => {
    try {
      await updateService(editingService.id, values);
      notification.success({ message: "Service modifié" });
      setOpenEdit(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      notification.error({ message: "Erreur", description: "Impossible de modifier le service" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      notification.success({ message: "Service supprimé" });
      fetchServices();
    } catch (err) {
      notification.error({ message: "Erreur", description: "Impossible de supprimer le service" });
    }
  };

  // ------------------ Table columns ------------------
  const columns = [
    { title: "Nom du service", dataIndex: "nom", key: "nom" },
   {
  title: "Chef de service",
  render: (_, record) =>
    record.chef_detail
      ? `${record.chef_detail.prenom} ${record.chef_detail.nom}`
      : <i style={{color:"#aaa"}}>Aucun</i>
}
,
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingService(record);
              form.setFieldsValue({
                nom: record.nom,
                chef: record.chef?.id || null,
              });
              setOpenEdit(true);
            }}
          />
          <Popconfirm
            title="Supprimer ce service ?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>Accueil</Breadcrumb.Item>
        <Breadcrumb.Item>Services</Breadcrumb.Item>
      </Breadcrumb>

      <h2>Gestion des Services</h2>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Input
              placeholder="Filtrer par nom"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filtrer par chef"
              value={filterChef}
              onChange={setFilterChef}
              allowClear
              style={{ width: "100%" }}
            >
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.prenom} {u.nom}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button onClick={resetFilters}>Réinitialiser</Button>
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setOpenAdd(true)}
        style={{ marginBottom: 16 }}
      >
        Ajouter un service
      </Button>

      <Table
        dataSource={filteredServices}
        rowKey="id"
        columns={columns}
        loading={loading}
        bordered
        size="small"
      />

      {/* Modal Add */}
      <Modal
        title="Ajouter un service"
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAdd}>
          <Form.Item name="nom" label="Nom du service" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="chef" label="Chef du service">
            <Select allowClear placeholder="Sélectionner un chef">
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.prenom} {u.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setOpenAdd(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">Créer</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Edit */}
      <Modal
        title="Modifier le service"
        open={openEdit}
        onCancel={() => setOpenEdit(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleEdit}>
          <Form.Item name="nom" label="Nom du service" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="chef" label="Chef du service">
            <Select allowClear placeholder="Sélectionner un chef">
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.prenom} {u.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setOpenEdit(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Services;
