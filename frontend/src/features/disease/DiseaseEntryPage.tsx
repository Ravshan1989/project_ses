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
