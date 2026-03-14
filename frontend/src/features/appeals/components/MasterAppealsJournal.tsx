import React, { useState } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, Input, Tag, Card, Row, Col, Statistic, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

interface MasterAppealsJournalProps {
    month: string;
    orgId: string;
    records: any[];
    autoReports: any;
    isLoading: boolean;
    onCreate: (values: any) => void;
    isCreating: boolean;
}

const MasterAppealsJournal: React.FC<MasterAppealsJournalProps> = ({
    month,
    orgId,
    records,
    autoReports,
    isLoading,
    onCreate,
    isCreating
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();


    const handleCreate = (values: any) => {
        onCreate({
            ...values,
            organization_id: orgId,
            period_month: month,
            registration_date: values.registration_date.format('YYYY-MM-DD'),
        });
        setIsModalVisible(false);
        form.resetFields();
    };

    const columns = [
        { title: 'Sana', dataIndex: 'registration_date', key: 'registration_date' },
        { title: 'F.I.O / Nom', dataIndex: 'applicant_name', key: 'applicant_name' },
        {
            title: 'Turi',
            dataIndex: 'applicant_type',
            key: 'applicant_type',
            render: (v: string) => v === 'PHYSICAL' ? <Tag color="blue">Jismoniy</Tag> : <Tag color="purple">Yuridik</Tag>
        },
        {
            title: 'Kanal',
            dataIndex: 'channel',
            key: 'channel',
            render: (v: string) => <Tag>{v}</Tag>
        },
        {
            title: 'Mavzu',
            dataIndex: 'appeal_type',
            key: 'appeal_type',
            render: (v: string) => {
                const colors = { ARIZA: 'green', SHIKOYAT: 'red', TAKLIF: 'cyan' };
                return <Tag color={colors[v as keyof typeof colors]}>{v}</Tag>;
            }
        },
        {
            title: 'Holat',
            dataIndex: 'status',
            key: 'status',
            render: (v: string) => <Tag color={v === 'BEING_CONSIDERED' ? 'warning' : 'success'}>{v}</Tag>
        },
    ];

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card size="small" className="glass-card" title="Avtomatik Hisobot Ko'rsatkichlari (Jurnal asosida)">
                        <Row gutter={16}>
                            <Col span={4}>
                                <Statistic title="Jami Murojaatlar" value={autoReports?.records_count || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title="Elektron" value={autoReports?.table1?.electronic_curr || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title="Shikoyatlar" value={autoReports?.table5?.phys_shikoyat_curr + autoReports?.table5?.legal_shikoyat_curr || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title="Ko'rilmoqda" value={autoReports?.table2?.being_considered || 0} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4}>Murojaatlar Ro'yxati (Jurnal)</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Murojaat Qo'shish
                </Button>
            </div>

            <Table
                dataSource={records}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Yangi Murojaat Qo'shish"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={isCreating}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ registration_date: dayjs() }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="registration_date" label="Qabul sanasi" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="applicant_name" label="Murojaatchi F.I.O / Tashkilot nomi" rules={[{ required: true }]}>
                                <Input placeholder="Eshmatov Toshmat..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="applicant_type" label="Murojaatchi turi" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Jismoniy shaxs', value: 'PHYSICAL' },
                                    { label: 'Yuridik shaxs', value: 'LEGAL' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="channel" label="Murojaat kanali" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Elektron', value: 'ELECTRONIC' },
                                    { label: 'Og\'zaki', value: 'ORAL' },
                                    { label: 'Yozma', value: 'WRITTEN' },
                                    { label: 'Virtual qabulxona', value: 'VIRTUAL_RECEPTION' },
                                    { label: 'Xalq qabulxonasi', value: 'PEOPLES_RECEPTION' },
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="appeal_type" label="Murojaat mavzusi" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Ariza', value: 'ARIZA' },
                                    { label: 'Shikoyat', value: 'SHIKOYAT' },
                                    { label: 'Taklif', value: 'TAKLIF' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Holati" initialValue="BEING_CONSIDERED">
                                <Select options={[
                                    { label: 'Ko\'rib chiqilmoqda', value: 'BEING_CONSIDERED' },
                                    { label: 'Qanoatlantirildi', value: 'SATISFIED' },
                                    { label: 'Tushuntirildi', value: 'EXPLAINED' },
                                    { label: 'Rad etildi', value: 'REJECTED' },
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="recipient" label="Kimga yuborildi (Table 1 uchun)" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Rahbariyat', value: 'head' },
                                    { label: 'Epidemiologiya o\'rinbosari', value: 'deputy_epid' },
                                    { label: 'Sanitariya o\'rinbosari', value: 'deputy_san' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="subject_key" label="Masala turi (Table 4 uchun)" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'San-epid faoliyati', value: 'san_epid' },
                                    { label: 'Koronavirus', value: 'coronavirus' },
                                    { label: 'Mehnat munosabatlari', value: 'labor' },
                                    { label: 'Tibbiy xizmat', value: 'medical' },
                                    { label: 'Rahbar ustidan shikoyat', value: 'complaint_leader' },
                                    { label: 'Xodimlar axloqi', value: 'staff_behavior' },
                                    { label: 'Dezinfeksiya', value: 'disinfection' },
                                    { label: 'Jarimalar', value: 'fines' },
                                    { label: 'Boshqa masalalar', value: 'other' },
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="summary" label="Qisqacha mazmuni">
                        <Input.TextArea rows={3} placeholder="Murojaat mazmuni haqida..." />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default MasterAppealsJournal;
