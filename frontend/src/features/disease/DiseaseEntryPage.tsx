import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, message, Select, InputNumber, Row, Col, Card } from 'antd';
import { UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import GlassLayout from '../../components/layout/GlassLayout';

const { Option } = Select;

// Mock Data for Dropdowns
const VACCINES = [
    'BCG (Silga qarshi)',
    'Gepatit B',
    'Polio (OPV)',
    'Pentavalent (DTP+HepB+Hib)',
    'Rotavirus',
    'Pnevmokokk',
    'Qizamiq, Parotit, Qizilcha (MPQ/MMR)',
    'COVID-19'
];

const DISTRICTS = [
    'Nurafshon shahri', 'Angren shahri', 'Bekobod shahri', 'Chirchiq shahri', 'Olmaliq shahri',
    'Ohangaron shahri', 'Yangiyo‘l shahri', 'Oqqo‘rg‘on tumani', 'Ohangaron tumani', 'Bekobod tumani',
    'Bo‘stonliq tumani', 'Bo‘ka tumani', 'Quyi Chirchiq tumani', 'Zangiota tumani', 'Yuqori Chirchiq tumani',
    'Qibray tumani', 'Parkent tumani', 'Piskent tumani', 'O‘rta Chirchiq tumani', 'Chinoz tumani',
    'Yangiyo‘l tumani', 'Toshkent tumani'
];

const DiseaseEntryPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = (values: any) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Vaccination Entry:', values);
            message.success('Emlash ma\'lumotlari muvaffaqiyatli kiritildi!');
            form.resetFields();
            setLoading(false);
        }, 1000);
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            const birthYear = date.year();
            const currentYear = dayjs().year();
            const age = currentYear - birthYear;
            form.setFieldsValue({ age: age >= 0 ? age : 0 });
        }
    };

    const sectionTitleStyle: React.CSSProperties = {
        marginBottom: '24px',
        borderBottom: '2px solid rgba(99, 102, 241, 0.1)',
        paddingBottom: '12px',
        color: '#4f46e5',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '18px',
        fontWeight: 700
    };

    return (
        <GlassLayout
            title="Emlashni Ro'yxatga Olish"
            subtitle="Yangi emlash holatini tizimga xavfsiz kiritish"
        >
            <style>{`
                .premium-form .ant-form-item-label > label {
                    font-weight: 600;
                    color: #475569;
                    font-size: 14px;
                }
                .dashboard-container.dark-mode .premium-form .ant-form-item-label > label {
                    color: rgba(255, 255, 255, 0.85);
                }
                .premium-form .ant-input, .premium-form .ant-input-number, .premium-form .ant-select-selector, .premium-form .ant-picker {
                    border-radius: 12px !important;
                    border: 1px solid #e2e8f0 !important;
                    padding: 8px 12px !important;
                    transition: all 0.3s ease;
                }
                .dashboard-container.dark-mode .premium-form .ant-input, 
                .dashboard-container.dark-mode .premium-form .ant-input-number, 
                .dashboard-container.dark-mode .premium-form .ant-select-selector, 
                .dashboard-container.dark-mode .premium-form .ant-picker {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                }
                .premium-form .ant-input:focus, .premium-form .ant-select-selector:focus {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
                }
                .save-btn {
                    height: 56px !important;
                    border-radius: 16px !important;
                    font-weight: 700 !important;
                    font-size: 16px !important;
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
                    border: none !important;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3) !important;
                    margin-top: 24px;
                    color: #fff !important;
                }
                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px rgba(99, 102, 241, 0.4) !important;
                }
            `}</style>

            <Card className="glass-card" bordered={false} styles={{ body: { padding: '40px' } }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                    className="premium-form"
                >
                    <Row gutter={[32, 32]}>
                        {/* Patient Info Section */}
                        <Col span={24}>
                            <div style={sectionTitleStyle}>
                                <UserOutlined /> Bemor Ma'lumotlari
                            </div>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="patientName"
                                label="Bemor F.I.Sh"
                                rules={[{ required: true, message: 'F.I.Sh kiritilishi shart' }]}
                            >
                                <Input placeholder="Masalan: Abdullayev Temur" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="birthDate"
                                label="Tug'ilgan sanasi"
                                rules={[{ required: true, message: 'Sana tanlang' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD.MM.YYYY"
                                    placeholder="Sanani tanlang"
                                    onChange={handleDateChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="age"
                                label="Yoshi"
                                rules={[{ required: true, message: 'Yoshini kiriting' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} max={120} disabled />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="passport"
                                label="Pasport / Guvohnoma seriyasi"
                            >
                                <Input placeholder="AA 1234567" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Telefon raqami"
                            >
                                <Input style={{ width: '100%' }} addonBefore="+998" placeholder="90 123 45 67" />
                            </Form.Item>
                        </Col>

                        {/* Location & Vaccine Section */}
                        <Col span={24}>
                            <div style={sectionTitleStyle}>
                                <EnvironmentOutlined /> Manzil va Emlash Turi
                            </div>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="district"
                                label="Yashash hududi (Tuman/Shahar)"
                                rules={[{ required: true, message: 'Hududni tanlang' }]}
                            >
                                <Select placeholder="Tanlang" showSearch>
                                    {DISTRICTS.map(d => <Option key={d} value={d}>{d}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Aniq manzili (Mahalla, Ko'cha, Uy)"
                                rules={[{ required: true, message: 'Manzilni kiriting' }]}
                            >
                                <Input placeholder="Navro'z MFY, Beruniy ko'chasi, 5-uy" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="vaccine"
                                label="Emlash turi / Vaksina"
                                rules={[{ required: true, message: 'Vaksinani tanlang' }]}
                            >
                                <Select placeholder="Vaksina turini tanlang" showSearch>
                                    {VACCINES.map(v => <Option key={v} value={v}>{v}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="vaccinationDate"
                                label="Emlash qilingan sana"
                                rules={[{ required: true, message: 'Sanani tanlang' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="comments"
                                label="Qo'shimcha izoh (Reaksiya, Seriya raqami)"
                            >
                                <Input.TextArea rows={3} placeholder="Vaksina seriyasi: A123, holati yaxshi..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block className="save-btn">
                            Ma'lumotlarni Saqlash
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </GlassLayout>
    );
};

export default DiseaseEntryPage;
