import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  message,
  Spin,
  Tag,
  Card,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import {
  fetchCourriers,
  // createCourrier,
  // uploadPieceJointe,
} from "../../services/courrierService";

import { getServices } from "../../api/service";
import { getCategories } from "../../api/categories";
import axios from "axios";
// import { token } from "../../api/auth";

const { Option } = Select;

const CourrierEntrants = () => {
  /* =======================
     STATES
  ======================= */
  const [courriers, setCourriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    service: null,
    category: null,
  });

  const [form] = Form.useForm();

  /* =======================
     LOAD COURRIERS
  ======================= */
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
    } catch {
      message.error("Erreur lors du chargement des courriers");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     INIT
  ======================= */
  useEffect(() => {
    loadCourriers();
    getServices().then(setServices);
    getCategories().then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================
     CREATE COURRIER
  ======================= */
const handleCreate = async (values) => {
  try {
    setLoading(true);

    const payload = {
      objet: values.objet,
      type: "entrant",
      reference: values.reference,
      expediteur_nom: values.expediteur_nom,
      date_reception: values.date_reception.format("YYYY-MM-DD"), // ✅ correction
      canal: values.canal,
      confidentialite: values.confidentialite,
      contenu_texte: values.contenu_texte || null,
    };

    await axios.post(
      "http://localhost:8000/api/courriers/entrant/",
      payload,
      {
        headers: {
          Authorization: `Token ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    message.success("Courrier enregistré avec succès !");
    fetchCourriers(); // pour rafraîchir la liste
  } catch (error) {
    console.error(error);
    message.error("Erreur lors de l'enregistrement du courrier");
  } finally {
    setLoading(false);
  }
};




  /* =======================
     TABLE COLUMNS
  ======================= */
  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      render: (v) => <b>{v}</b>,
    },
    {
      title: "Objet",
      dataIndex: "objet",
      ellipsis: true,
    },
    {
      title: "Expéditeur",
      dataIndex: "expediteur_nom",
    },
    {
      title: "Service",
      dataIndex: ["service_impute", "nom"],
      render: (v) => v || <Tag color="orange">Non imputé</Tag>,
    },
    {
      title: "Confidentialité",
      dataIndex: "confidentialite",
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Date réception",
      dataIndex: "date_reception",
    },
  ];

  /* =======================
     RENDER
  ======================= */
  return (
    <Card
      title=" Courriers entrants"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadCourriers} />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
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
            loadCourriers();
          }}
          style={{ width: 220 }}
        />

        <Select
          placeholder="Service"
          allowClear
          style={{ width: 180 }}
          onChange={(v) => {
            setFilters({ ...filters, service: v });
            loadCourriers();
          }}
        >
          {services.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.nom}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Catégorie"
          allowClear
          style={{ width: 180 }}
          onChange={(v) => {
            setFilters({ ...filters, category: v });
            loadCourriers();
          }}
        >
          {categories.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.nom}
            </Option>
          ))}
        </Select>
      </Space>

      {/* TABLE */}
      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={courriers}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* MODAL CREATION */}
      <Modal
        title="Nouveau courrier entrant"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item
            name="objet"
            label="Objet"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="expediteur_nom" label="Expéditeur">
            <Input />
          </Form.Item>

          <Form.Item name="expediteur_email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="expediteur_telephone" label="Téléphone">
            <Input />
          </Form.Item>

          <Form.Item
            name="date_reception"
            label="Date de réception"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="canal" label="Canal">
            <Select>
              <Option value="Physique">Physique</Option>
              <Option value="Email">Email</Option>
              <Option value="Portail">Portail</Option>
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
            <Select allowClear>
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="service_impute" label="Service imputé">
            <Select allowClear>
              {services.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="piece_jointe" label="Pièce jointe">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Joindre un fichier</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CourrierEntrants;
