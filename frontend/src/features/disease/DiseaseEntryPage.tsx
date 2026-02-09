import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, message, Select, InputNumber, Row, Col, Typography } from 'antd';
import { MedicineBoxOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
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
    'Ohangaron shahri', 'Yangiyoâ€˜l shahri', 'Oqqoâ€˜rgâ€˜on tumani', 'Ohangaron tumani', 'Bekobod tumani',
    'Boâ€˜stonliq tumani', 'Boâ€˜ka tumani', 'Quyi Chirchiq tumani', 'Zangiota tumani', 'Yuqori Chirchiq tumani',
    'Qibray tumani', 'Parkent tumani', 'Piskent tumani', 'Oâ€˜rta Chirchiq tumani', 'Chinoz tumani',
    'Yangiyoâ€˜l tumani', 'Toshkent tumani'
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

    // --- PREMIUM UI STYLES ---
    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
        padding: '40px'
    };

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        padding: '40px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
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
        <div style={{ padding: '40px 24px', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <style>{`
                    .premium-form .ant-form-item-label > label {
                        font-weight: 600;
                        color: #475569;
                        font-size: 14px;
                    }
                    .premium-form .ant-input, .premium-form .ant-input-number, .premium-form .ant-select-selector, .premium-form .ant-picker {
                        border-radius: 12px !important;
                        border: 1px solid #e2e8f0 !important;
                        padding: 8px 12px !important;
                        transition: all 0.3s ease;
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
                    }
                    .save-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 15px 25px rgba(99, 102, 241, 0.4) !important;
                    }
                `}</style>

                <div style={headerStyle}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                        <MedicineBoxOutlined style={{ fontSize: '150px' }} />
                    </div>
                    <MedicineBoxOutlined style={{ fontSize: '48px', color: '#fff', marginBottom: '16px' }} />
                    <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Emlashni Ro'yxatga Olish
                    </Title>
                    <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
                        Yangi emlash holatini tizimga xavfsiz kiritish
                    </Typography.Text>
                </div>

                <div style={glassStyle}>
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
                </div>
            </div>
        </div>
    );
};

export default DiseaseEntryPage;


/* 
ORIGINAL CODE (Append-only rule):
import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Card, message, Select, InputNumber, Row, Col, Typography } from 'antd';
import { MedicineBoxOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
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
    'Ohangaron shahri', 'YangiyoòÀØl shahri', 'OqqoòÀØrgòÀØon tumani', 'Ohangaron tumani', 'Bekobod tumani',
    'BoòÀØstonliq tumani', 'BoòÀØka tumani', 'Quyi Chirchiq tumani', 'Zangiota tumani', 'Yuqori Chirchiq tumani',
    'Qibray tumani', 'Parkent tumani', 'Piskent tumani', 'OòÀØrta Chirchiq tumani', 'Chinoz tumani',
    'YangiyoòÀØl tumani', 'Toshkent tumani'
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

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 0' }}>
            <Card
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <MedicineBoxOutlined style={{ fontSize: '36px', color: '#1677ff', marginBottom: '12px' }} />
                    <Title level={2} style={{ margin: 0 }}>Emlashni Ro'yxatga Olish</Title>
                    <Typography.Text type="secondary">Yangi emlash holatini tizimga kiritish</Typography.Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Row gutter={24}>
                        {/* Patient Info Section */}
                        <Col span={24}>
                            <Title level={5} style={{ marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                <UserOutlined /> Bemor Ma'lumotlari
                            </Title>
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
                        <Col span={24} style={{ marginTop: '16px' }}>
                            <Title level={5} style={{ marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                <EnvironmentOutlined /> Manzil va Emlash Turi
                            </Title>
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

                    <Form.Item style={{ marginTop: '16px' }}>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: '48px', fontSize: '16px' }}>
                            Saqlash
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default DiseaseEntryPage;

 
*/

