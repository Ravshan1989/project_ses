import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/api';

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFinish = async (values: any) => {
        try {
            setLoading(true);
            await usersApi.changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            message.success('Parolingiz muvaffaqiyatli o\'zgartirildi! Iltimos, qayta kiring.');
            
            // Log out user
            localStorage.clear();
            onClose();
            navigate('/login');
        } catch (error: any) {
            console.error('Change password error:', error);
            const errMessage = error.response?.data?.message || 'Xatolik yuz berdi';
            message.error(Array.isArray(errMessage) ? errMessage[0] : errMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LockOutlined style={{ color: '#1890ff' }} />
                    <span>Parolni O'zgartirish</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            maskClosable={false}
        >
            <div style={{ padding: '16px 0' }}>
                <p style={{ color: '#8c8c8c', marginBottom: '24px' }}>
                    Yangi parolingiz kamida 8 ta belgidan iborat, katta harf, kichik harf va son(yoki maxsus belgi) qatnashgan bo'lishi shart. O'zgartirilgandan so'ng, tizimdan avtomatik chiqilishi amalga oshadi.
                </p>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    <Form.Item
                        name="oldPassword"
                        label="Joriy parol"
                        rules={[{ required: true, message: 'Iltimos, joriy parolni kiriting!' }]}
                    >
                        <Input.Password placeholder="Joriy parolni kiriting" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Yangi parol"
                        rules={[
                            { required: true, message: 'Iltimos, yangi parolni kiriting!' },
                            { min: 8, message: 'Parol kamida 8 ta belgidan iborat bo\'lishi shart!' },
                            {
                                pattern: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
                                message: 'Katta va kichik harflar va sonlar aralashmasidan iborat bo\'lishi shart!'
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder="Yangi parolni kiriting" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Yangi parolni tasdiqlang"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Iltimos, parolni tasdiqlang!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Parollar mos kelmadi!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Yangi parolni tasdiqlab yozing" size="large" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '24px', marginBottom: 0, textAlign: 'right' }}>
                        <Button onClick={onClose} style={{ marginRight: '8px' }} size="large">
                            Bekor qilish
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Saqlash
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default ChangePasswordModal;
