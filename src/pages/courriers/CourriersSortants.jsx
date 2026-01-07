import React, { useEffect, useState } from "react";
import {
  Table, Button, Space, Modal, Form, Input, Upload,
  DatePicker, Select, message, Spin, Card, Tag, Popconfirm
} from "antd";
import {
  PlusOutlined, ReloadOutlined, UploadOutlined,
  EyeFilled, EditFilled, DeleteFilled
} from "@ant-design/icons";
import { getServices } from "../../api/service";
import { getCategories } from "../../api/categories";
import { 
  fetchCourriers, 
  createCourrier, 
  updateCourrier, 
  deleteCourrier,
  checkAuth 
} from "../../services/courrierService";
import dayjs from "dayjs";

const { Option } = Select;

const CourriersSortants = () => {
  const [courriers, setCourriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  /* =======================
     LOAD COURRIERS SORTANTS
  ======================= */
  const loadCourriers = async () => {
    setLoading(true);
    try {
      // Utiliser l'endpoint générique avec le paramètre type=sortant
      const data = await fetchCourriers({ type: "sortant" });
      setCourriers(data.results || data);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Session expirée. Veuillez vous reconnecter");
      } else {
        message.error("Erreur lors du chargement des courriers sortants");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier l'authentification
    if (!checkAuth()) {
      message.error("Veuillez vous connecter");
      // window.location.href = "/login";
    }
    
    loadCourriers();
    getServices().then(setServices);
    getCategories().then(setCategories);
  }, []);

  /* =======================
     CREATE / UPDATE
  ======================= */
  const handleCreate = async (values) => {
    try {
      setLoading(true);

      const payload = {
        objet: values.objet,
        destinataire_nom: values.destinataire_nom,
        destinataire_adresse: values.destinataire_adresse,
        destinataire_email: values.destinataire_email,
        date_envoi: values.date_envoi.format("YYYY-MM-DD"),
        canal: values.canal,
        confidentialite: values.confidentialite,
        type: "sortant",
        category: values.category,
        service_impute: values.service_id,
        priorite: values.priorite || "normale",
      };

      if (editingId) {
        // UPDATE - utiliser le service updateCourrier
        await updateCourrier(editingId, payload);
        message.success("Courrier modifié avec succès");
      } else {
        // CREATE - utiliser le service createCourrier
        await createCourrier(payload);
        message.success("Courrier créé avec succès");
      }

      setOpen(false);
      setEditingId(null);
      form.resetFields();
      loadCourriers();
    } catch (error) {
      console.error("Erreur opération:", error);
      if (error.response?.status === 401) {
        message.error("Session expirée. Veuillez vous reconnecter");
      } else if (error.response?.data) {
        message.error(error.response.data.detail || "Erreur lors de l'opération");
      } else {
        message.error("Erreur lors de l'opération");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     DELETE
  ======================= */
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

  /* =======================
     VIEW DETAILS
  ======================= */
  const handleView = (courrier) => {
    Modal.info({
      title: "Détails du courrier sortant",
      width: 700,
      content: (
        <div style={{ marginTop: 20 }}>
          <p><b>Référence :</b> {courrier.reference}</p>
          <p><b>Objet :</b> {courrier.objet}</p>
          <p><b>Destinataire :</b> {courrier.destinataire_nom}</p>
          <p><b>Adresse :</b> {courrier.destinataire_adresse || "Non renseignée"}</p>
          <p><b>Email :</b> {courrier.destinataire_email || "Non renseigné"}</p>
          <p><b>Date d'envoi :</b> {courrier.date_envoi}</p>
          <p><b>Canal :</b> {courrier.canal}</p>
          <p><b>Confidentialité :</b> {courrier.confidentialite}</p>
          <p><b>Priorité :</b> {courrier.priorite}</p>
          <p><b>Service imputé :</b> {courrier.service_impute?.nom || "Non imputé"}</p>
          <p><b>Catégorie :</b> {courrier.category?.name || "Non classé"}</p>
          <p><b>Statut :</b> {courrier.statut}</p>
        </div>
      ),
    });
  };

  /* =======================
     EDIT COURRIER
  ======================= */
  const handleEdit = (courrier) => {
    setEditingId(courrier.id);
    setOpen(true);
    
    form.setFieldsValue({
      objet: courrier.objet,
      destinataire_nom: courrier.destinataire_nom,
      destinataire_adresse: courrier.destinataire_adresse,
      destinataire_email: courrier.destinataire_email,
      date_envoi: courrier.date_envoi ? dayjs(courrier.date_envoi) : null,
      canal: courrier.canal,
      confidentialite: courrier.confidentialite,
      priorite: courrier.priorite,
      category: courrier.category?.id,
      service_id: courrier.service_impute?.id,
    });
  };

  /* =======================
     COLUMNS
  ======================= */
  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      render: (v) => <b>{v}</b>,
      sorter: (a, b) => a.reference.localeCompare(b.reference),
    },
    {
      title: "Objet",
      dataIndex: "objet",
      ellipsis: true,
    },
    {
      title: "Destinataire",
      dataIndex: "destinataire_nom",
    },
    {
      title: "Priorité",
      dataIndex: "priorite",
      render: (v) => {
        const colors = {
          urgente: "red",
          haute: "orange",
          normale: "blue",
          basse: "green"
        };
        return <Tag color={colors[v] || "default"}>{v}</Tag>;
      },
    },
    {
      title: "Date d'envoi",
      dataIndex: "date_envoi",
      sorter: (a, b) => new Date(a.date_envoi) - new Date(b.date_envoi),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      render: (v) => <Tag color={
        v === "repondu" ? "success" : 
        v === "traitement" ? "processing" : 
        v === "impute" ? "warning" : "default"
      }>{v}</Tag>,
    },
    {
      title: "Actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <EyeFilled
            style={{ color: "#1677ff", fontSize: 18, cursor: "pointer" }}
            onClick={() => handleView(record)}
          />
          <EditFilled
            style={{ color: "#52c41a", fontSize: 18, cursor: "pointer" }}
            onClick={() => handleEdit(record)}
          />
          <DeleteFilled
            style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  /* =======================
     RENDER
  ======================= */
  return (
    <Card
      title="Courriers sortants"
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
      {/* FILTRES RAPIDES */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Button 
          onClick={() => {
            // Filtrer les urgents
            loadCourriers();
          }}
        >
          Tous
        </Button>
        <Button 
          onClick={() => {
            // Filtrer par urgence
          }}
        >
          Urgents
        </Button>
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

      {/* MODAL CREATION/EDITION */}
      <Modal
        title={editingId ? "Modifier courrier sortant" : "Nouveau courrier sortant"}
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
            canal: "email",
            confidentialite: "normale",
            priorite: "normale"
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
            name="destinataire_nom"
            label="Destinataire"
            rules={[{ required: true, message: "Le destinataire est obligatoire" }]}
          >
            <Input placeholder="Nom du destinataire" />
          </Form.Item>

          <Form.Item
            name="destinataire_adresse"
            label="Adresse du destinataire"
          >
            <Input.TextArea placeholder="Adresse complète" rows={2} />
          </Form.Item>

          <Form.Item
            name="destinataire_email"
            label="Email du destinataire"
            rules={[
              { type: 'email', message: "Format d'email invalide" }
            ]}
          >
            <Input placeholder="email@exemple.com" />
          </Form.Item>

          <Form.Item
            name="date_envoi"
            label="Date d'envoi"
            rules={[{ required: true, message: "La date d'envoi est obligatoire" }]}
          >
            <DatePicker 
              style={{ width: "100%" }} 
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item name="canal" label="Canal">
            <Select>
              <Option value="email">Email</Option>
              <Option value="physique">Physique</Option>
              <Option value="portail">Portail</Option>
              <Option value="telephone">Téléphone</Option>
              <Option value="autre">Autre</Option>
            </Select>
          </Form.Item>

          <Form.Item name="confidentialite" label="Confidentialité">
            <Select>
              <Option value="normale">Normale</Option>
              <Option value="restreinte">Restreinte</Option>
              <Option value="confidentielle">Confidentielle</Option>
            </Select>
          </Form.Item>

          <Form.Item name="priorite" label="Priorité">
            <Select>
              <Option value="urgente">Urgente</Option>
              <Option value="haute">Haute</Option>
              <Option value="normale">Normale</Option>
              <Option value="basse">Basse</Option>
            </Select>
          </Form.Item>

          <Form.Item name="category" label="Catégorie">
            <Select allowClear placeholder="Sélectionner une catégorie">
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="service_id"
            label="Service imputé"
            rules={[{ required: true, message: "Le service est obligatoire" }]}
          >
            <Select allowClear placeholder="Sélectionner un service">
              {services.map(s => (
                <Option key={s.id} value={s.id}>{s.nom}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                }}
              >
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

export default CourriersSortants;