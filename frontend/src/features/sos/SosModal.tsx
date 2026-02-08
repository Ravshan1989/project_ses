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
                <Space style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#fff1f0', padding: '8px', borderRadius: '10px' }}>
                        <AlertOutlined style={{ fontSize: '20px' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.5px' }}>
                        FAVQULODDA HOLAT (SOS)
                    </span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose} style={{ borderRadius: '10px' }}>
                    Bekor qilish
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    danger
                    loading={loading}
                    onClick={handleSubmit}
                    style={{
                        borderRadius: '10px',
                        fontWeight: 700,
                        height: '40px',
                        padding: '0 24px',
                        background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(255, 77, 79, 0.4)'
                    }}
                >
                    SOS YUBORISH
                </Button>,
            ]}
            width={600}
            style={{ borderRadius: '24px' }}
        >
            <Alert
                message={<span style={{ fontWeight: 700 }}>DIQQAT!</span>}
                description="SOS xabari yuborilgandan so'ng uni bekor qilib bo'lmaydi. Faqat haqiqiy favqulodda holatlar uchun ishlating."
                type="error"
                showIcon
                style={{
                    marginBottom: 24,
                    borderRadius: '16px',
                    border: '1px solid #ffccc7',
                    background: '#fff2f0'
                }}
            />

            <Form form={form} layout="vertical">
                <Form.Item label="Kasallikni tanlash usuli" name="selectionType" initialValue="list">
                    <Radio.Group
                        onChange={(e) => setIsManual(e.target.value === 'manual')}
                        style={{ width: '100%' }}
                    >
                        <Radio.Button value="list" style={{ width: '50%', textAlign: 'center', borderRadius: '10px 0 0 10px' }}>Ro'yxatdan tanlash</Radio.Button>
                        <Radio.Button value="manual" style={{ width: '50%', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>Qo'lda kiritish</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {!isManual ? (
                    <Form.Item
                        name="selectedDisease"
                        label="Aniqlangan yoki gumon qilinayotgan kasallik"
                        rules={[{ required: true, message: 'Iltimos, kasallikni tanlang!' }]}
                    >
                        <Select
                            placeholder="Kasallikni tanlang"
                            size="large"
                            style={{ borderRadius: '10px' }}
                        >
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
                        <Input
                            placeholder="Masalan: Noma'lum virus..."
                            size="large"
                            style={{ borderRadius: '10px' }}
                        />
                    </Form.Item>
                )}

                <Form.Item
                    name="status"
                    label="Holat turi"
                    rules={[{ required: true, message: 'Iltimos, holat turini tanlang!' }]}
                >
                    <Radio.Group style={{ width: '100%' }}>
                        <Radio.Button value="CONFIRMED" style={{ width: '50%', textAlign: 'center', borderRadius: '10px 0 0 10px' }}>ANIQLANGAN</Radio.Button>
                        <Radio.Button value="SUSPECTED" style={{ width: '50%', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>GUMON QILINMOQDA</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item name="comment" label="Qisqa izoh (tavsiya etiladi)">
                    <Input.TextArea
                        rows={3}
                        placeholder="Vaziyat haqida qisqacha ma'lumot..."
                        style={{ borderRadius: '12px' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SosModal;
