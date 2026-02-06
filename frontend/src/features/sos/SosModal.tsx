import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Radio, Button, message, Alert, Space } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import { sosService } from '../../services/sos.service';

interface SosModalProps {
    visible: boolean;
    onClose: () => void;
}

const SosModal: React.FC<SosModalProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [diseases, setDiseases] = useState<any[]>([]);
    const [isManual, setIsManual] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchDiseases();
        }
    }, [visible]);

    const fetchDiseases = async () => {
        try {
            const data = await sosService.getDiseases();
            setDiseases(data);
        } catch (error) {
            console.error('Kasalliklarni yuklashda xatolik:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                diseaseName: isManual ? values.manualDisease : values.selectedDisease,
                status: values.status,
                comment: values.comment,
            };

            await sosService.createAlert(payload);
            message.success('SOS xabar muvaffaqiyatli yuborildi!');
            form.resetFields();
            setIsManual(false);
            onClose();
        } catch (error) {
            console.error('SOS yuborishda xatolik:', error);
            message.error('SOS xabarni yuborishda xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space style={{ color: '#ff4d4f' }}>
                    <AlertOutlined />
                    <span>FAVQULODDA HOLAT (SOS)</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Bekor qilish
                </Button>,
                <Button key="submit" type="primary" danger loading={loading} onClick={handleSubmit}>
                    SOS YUBORISH
                </Button>,
            ]}
            width={600}
        >
            <Alert
                message="DIQQAT!"
                description="SOS xabari yuborilgandan so'ng uni bekor qilib bo'lmaydi. Faqat haqiqiy favqulodda holatlar uchun ishlating."
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
            />

            <Form form={form} layout="vertical">
                <Form.Item label="Kasallikni tanlash usuli" name="selectionType" initialValue="list">
                    <Radio.Group onChange={(e) => setIsManual(e.target.value === 'manual')}>
                        <Radio value="list">Ro'yxatdan tanlash</Radio>
                        <Radio value="manual">Qo'lda kiritish</Radio>
                    </Radio.Group>
                </Form.Item>

                {!isManual ? (
                    <Form.Item
                        name="selectedDisease"
                        label="Aniqlangan yoki gumon qilinayotgan kasallik"
                        rules={[{ required: true, message: 'Iltimos, kasallikni tanlang!' }]}
                    >
                        <Select placeholder="Kasallikni tanlang">
                            <Select.OptGroup label="Aniqlangan kasalliklar">
                                {diseases.filter(d => d.type === 'CONFIRMED').map(d => (
                                    <Select.Option key={d.id} value={d.name}>{d.name}</Select.Option>
                                ))}
                            </Select.OptGroup>
                            <Select.OptGroup label="Gumon qilinayotgan kasalliklar">
                                {diseases.filter(d => d.type === 'SUSPECTED').map(d => (
                                    <Select.Option key={d.id} value={d.name}>{d.name}</Select.Option>
                                ))}
                            </Select.OptGroup>
                        </Select>
                    </Form.Item>
                ) : (
                    <Form.Item
                        name="manualDisease"
                        label="Kasallik nomini qo'lda kiriting"
                        rules={[{ required: true, message: 'Iltimos, kasallik nomini yozing!' }]}
                    >
                        <Input placeholder="Masalan: Noma'lum virus..." />
                    </Form.Item>
                )}

                <Form.Item
                    name="status"
                    label="Holat turi"
                    rules={[{ required: true, message: 'Iltimos, holat turini tanlang!' }]}
                >
                    <Radio.Group>
                        <Radio value="CONFIRMED">ANIQLANGAN</Radio>
                        <Radio value="SUSPECTED">GUMON QILINMOQDA</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item name="comment" label="Qisqa izoh (tavsiya etiladi)">
                    <Input.TextArea rows={3} placeholder="Vaziyat haqida qisqacha ma'lumot..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SosModal;
