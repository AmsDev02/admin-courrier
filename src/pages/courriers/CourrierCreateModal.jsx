import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Button,
  notification,
} from "antd";

import { createCourrier } from "../../api/courriers";
import { getServices } from "../../api/service";
import { getCategories } from "../../api/categories";

const { Option } = Select;

const CourrierCreateModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [services, setServices] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    getServices().then(setServices);
    getCategories().then(setCategories);
  }, []);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createCourrier({
        ...values,
        type: "entrant",
      });

      notification.success({
        message: "Succès",
        description: "Courrier enregistré avec succès",
      });

      form.resetFields();
      onSuccess();
      onClose();
    } catch (e) {
      if (e?.errorFields) return;
      notification.error({
        message: "Erreur",
        description: "Impossible de créer le courrier",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="📩 Nouveau courrier entrant"
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={onSubmit}
        >
          Enregistrer
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="reference"
              label="Référence"
              rules={[{ required: true }]}
            >
              <Input placeholder="REF-2025-001" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="date_reception"
              label="Date de réception"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="objet"
          label="Objet"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="expediteur_nom" label="Expéditeur">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="canal" label="Canal">
              <Select allowClear>
                <Option value="physique">Physique</Option>
                <Option value="email">Email</Option>
                <Option value="portail">Portail</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="category" label="Catégorie">
              <Select allowClear>
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="service_impute" label="Service imputé">
              <Select allowClear>
                {services.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CourrierCreateModal;
