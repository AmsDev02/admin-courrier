import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Table, Button, Space, Modal, Form, Input, DatePicker, Select,
  Upload, message, Spin, Tag, Card
} from "antd";
import {
  PlusOutlined, ReloadOutlined, UploadOutlined,
  EyeFilled, EditFilled, DeleteFilled
} from "@ant-design/icons";

import {
  fetchCourriers,
  createCourrier,
  updateCourrier,
  deleteCourrier,
  checkAuth
} from "../../services/courrierService";

import { getServices } from "../../api/service";
import { getCategories } from "../../api/categories";

const { Option } = Select;

const CourrierEntrants = () => {
  const [courriers, setCourriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    service: null,
    category: null,
  });
  const [form] = Form.useForm();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!checkAuth()) {
      message.error("Veuillez vous connecter");
      // Rediriger vers la page de login si nécessaire
      // window.location.href = "/login";
    }
  }, []);

  const loadCourriers = async () => {
    setLoading(true);
    try {
      const data = await fetchCourriers({
        type: "entrant",
        search: filters.search,
        service: filters.service,
        category: filters.category,
      });
      setCourriers(data.results || data);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Session expirée. Veuillez vous reconnecter");
        // Rediriger vers login
        // window.location.href = "/login";
      } else {
        message.error("Erreur lors du chargement des courriers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourriers();
    getServices().then(setServices);
    getCategories().then(setCategories);
  }, [filters]);

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        objet: values.objet,
        expediteur_nom: values.expediteur_nom,
        expediteur_email: values.expediteur_email,
        expediteur_telephone: values.expediteur_telephone,
        date_reception: values.date_reception.format("YYYY-MM-DD"),
        canal: values.canal,
        confidentialite: values.confidentialite,
        category: values.category,
        service_impute: values.service_id,
        type: "entrant"
      };

      if (editingId) {
        await updateCourrier(editingId, payload);
        message.success("Courrier modifié avec succès");
      } else {
        await createCourrier(payload);
        message.success("Courrier enregistré avec succès");
      }

      setOpen(false);
      setEditingId(null);
      form.resetFields();
      loadCourriers();
    } catch (error) {
      console.error("Erreur création:", error);
      if (error.response?.status === 401) {
        message.error("Session expirée. Veuillez vous reconnecter");
      } else {
        message.error(error.response?.data?.detail || "Erreur lors de l'opération");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = (courrier) => {
    Modal.info({
      title: "Détails du courrier",
      width: 600,
      content: (
        <div style={{ marginTop: 20 }}>
          <p><b>Référence :</b> {courrier.reference}</p>
          <p><b>Objet :</b> {courrier.objet}</p>
          <p><b>Expéditeur :</b> {courrier.expediteur_nom}</p>
          <p><b>Email :</b> {courrier.expediteur_email || "Non renseigné"}</p>
          <p><b>Téléphone :</b> {courrier.expediteur_telephone || "Non renseigné"}</p>
          <p><b>Service imputé :</b> {courrier.service_impute?.nom || "Non imputé"}</p>
          <p><b>Date réception :</b> {courrier.date_reception}</p>
          <p><b>Canal :</b> {courrier.canal}</p>
          <p><b>Confidentialité :</b> {courrier.confidentialite}</p>
        </div>
      ),
    });
  };

  const handleEdit = (courrier) => {
    setEditingId(courrier.id);
    setOpen(true);
    
    form.setFieldsValue({
      objet: courrier.objet,
      expediteur_nom: courrier.expediteur_nom,
      expediteur_email: courrier.expediteur_email,
      expediteur_telephone: courrier.expediteur_telephone,
      date_reception: courrier.date_reception ? dayjs(courrier.date_reception) : null,
      canal: courrier.canal,
      confidentialite: courrier.confidentialite,
      category: courrier.category,
      service_id: courrier.service_id,
    });
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous vraiment supprimer ce courrier ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          await deleteCourrier(id);
          message.success("Courrier supprimé");
          loadCourriers();
        } catch (error) {
          if (error.response?.status === 401) {
            message.error("Session expirée");
          } else {
            message.error("Erreur lors de la suppression");
          }
        }
      },
    });
  };

  const columns = [
    { title: "Référence", dataIndex: "reference", render: (v) => <b>{v}</b> },
    { title: "Objet", dataIndex: "objet", ellipsis: true },
    { title: "Expéditeur", dataIndex: "expediteur_nom" },
    {
      title: "Service",
      render: (_, record) =>
        record.imputations?.length > 0
          ? record.imputations[0].service_nom
          : <Tag color="orange">Non imputé</Tag>,
    },
    {
      title: "Confidentialité",
      dataIndex: "confidentialite",
      render: (v) => <Tag color={
        v === "confidentiel" ? "red" : 
        v === "restreint" ? "orange" : "blue"
      }>{v}</Tag>,
    },
    { title: "Date réception", dataIndex: "date_reception" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <EyeFilled
            style={{ color: "#0d6d0dff", cursor: "pointer", fontSize: "16px" }}
            onClick={() => handleView(record)}
          />
          <EditFilled
            style={{ color: "#3f1fb4ff", cursor: "pointer", fontSize: "16px" }}
            onClick={() => handleEdit(record)}
          />
          <DeleteFilled
            style={{ color: "#e7132fff", cursor: "pointer", fontSize: "16px" }}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Courriers entrants"
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadCourriers}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              setOpen(true);
              form.resetFields();
            }}
          >
            Nouveau courrier
          </Button>
        </Space>
      }
    >
      {/* FILTRES */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Recherche objet / référence"
          allowClear
          onSearch={(v) => {
            setFilters({ ...filters, search: v });
          }}
          style={{ width: 220 }}
          enterButton
        />
        <Select
          placeholder="Service"
          allowClear
          style={{ width: 180 }}
          onChange={(v) => setFilters({ ...filters, service: v })}
        >
          {services.map((s) => (
            <Option key={s.id} value={s.id}>{s.nom}</Option>
          ))}
        </Select>
        <Select
          placeholder="Catégorie"
          allowClear
          style={{ width: 180 }}
          onChange={(v) => setFilters({ ...filters, category: v })}
        >
          {categories.map((c) => (
            <Option key={c.id} value={c.id}>{c.nom}</Option>
          ))}
        </Select>
      </Space>

      {/* TABLE */}
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={courriers}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} courriers`
          }}
        />
      </Spin>

      {/* MODAL */}
      <Modal
        title={editingId ? "Modifier le courrier" : "Nouveau courrier entrant"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreate}
          initialValues={{
            canal: "Physique",
            confidentialite: "normal"
          }}
        >
          <Form.Item
            name="objet"
            label="Objet"
            rules={[{ required: true, message: "L'objet est obligatoire" }]}
          >
            <Input placeholder="Objet du courrier" />
          </Form.Item>

          <Form.Item
            name="expediteur_nom"
            label="Expéditeur"
            rules={[{ required: true, message: "L'expéditeur est obligatoire" }]}
          >
            <Input placeholder="Nom de l'expéditeur" />
          </Form.Item>

          <Form.Item name="expediteur_email" label="Email">
            <Input placeholder="email@exemple.com" />
          </Form.Item>

          <Form.Item name="expediteur_telephone" label="Téléphone">
            <Input placeholder="+226 ......" />
          </Form.Item>

          <Form.Item
            name="date_reception"
            label="Date de réception"
            rules={[{ required: true, message: "La date est obligatoire" }]}
          >
            <DatePicker 
              style={{ width: "100%" }} 
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item name="canal" label="Canal">
            <Select>
              <Option value="Physique">Physique</Option>
              <Option value="Email">Email</Option>
              <Option value="Portail">Portail</Option>
              <Option value="Téléphone">Téléphone</Option>
            </Select>
          </Form.Item>

          <Form.Item name="confidentialite" label="Confidentialité">
            <Select>
              <Option value="normal">Normal</Option>
              <Option value="restreint">Restreint</Option>
              <Option value="confidentiel">Confidentiel</Option>
            </Select>
          </Form.Item>

          <Form.Item name="category" label="Catégorie">
            <Select allowClear placeholder="Sélectionnez une catégorie">
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>{c.nom}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="service_id"
            label="Service imputé"
            rules={[{ required: true, message: "Le service est obligatoire" }]}
          >
            <Select allowClear placeholder="Sélectionnez un service">
              {services.map(s => (
                <Option key={s.id} value={s.id}>{s.nom}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="piece_jointe" label="Pièce jointe">
            <Upload 
              beforeUpload={() => false} 
              maxCount={1}
              accept=".pdf,.doc,.docx,.jpg,.png"
            >
              <Button icon={<UploadOutlined />}>Sélectionner un fichier</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setOpen(false);
                setEditingId(null);
              }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? "Modifier" : "Enregistrer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CourrierEntrants;