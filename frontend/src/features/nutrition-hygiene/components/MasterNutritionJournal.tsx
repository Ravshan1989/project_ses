import React, { useState } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, Input, Tag, Card, Row, Col, Statistic, Typography, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

interface MasterNutritionJournalProps {
    month: string;
    orgId: string;
    records: any[];
    autoReports: any;
    isLoading: boolean;
    onCreate: (values: any) => void;
    isCreating: boolean;
}

const MasterNutritionJournal: React.FC<MasterNutritionJournalProps> = ({
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
    const entryType = Form.useWatch('entry_type', form);

    const handleCreate = (values: any) => {
        onCreate({
            ...values,
            organization_id: orgId,
            period_month: month,
            action_date: values.action_date.format('YYYY-MM-DD'),
        });
        setIsModalVisible(false);
        form.resetFields();
    };

    const columns = [
        { title: 'Sana', dataIndex: 'action_date', key: 'action_date' },
        { title: 'Obyekt', dataIndex: 'object_name', key: 'object_name' },
        {
            title: 'Turi',
            dataIndex: 'entry_type',
            key: 'entry_type',
            render: (v: string) => <Tag color={v === 'INSPECTION' ? 'blue' : 'green'}>{v}</Tag>
        },
        {
            title: 'Natija',
            dataIndex: 'lab_result',
            key: 'lab_result',
            render: (v: string) => v === 'MEETS' ? <Tag color="success">Mos</Tag> : (v === 'NOT_MEETS' ? <Tag color="error">Nomos</Tag> : <Tag>N/A</Tag>)
        }
    ];

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card size="small" title="Ovqatlanish Gigiyenasi - Avto Hisobot">
                        <Row gutter={16}>
                            <Col span={4}><Statistic title="Jami Yozuvlar" value={autoReports?.records_count || 0} /></Col>
                            <Col span={4}><Statistic title="Jarima Summasi" value={autoReports?.table1?.sanitary_fine_sum || 0} suffix="so'm" /></Col>
                            <Col span={4}><Statistic title="Lab. Namunalar" value={autoReports?.table3?.total_samples || 0} /></Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4}>Gigiyena Jurnali</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Yozuv Qo'shish</Button>
            </div>

            <Table dataSource={records} columns={columns} loading={isLoading} rowKey="id" size="small" />

            <Modal title="Yangi Yozuv" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} confirmLoading={isCreating}>
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ action_date: dayjs(), entry_type: 'INSPECTION' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="action_date" label="Sana" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="entry_type" label="Yozuv turi" rules={[{ required: true }]}>
                                <Select options={[{ label: 'Tekshiruv', value: 'INSPECTION' }, { label: 'Lab. Namuna', value: 'LAB_SAMPLE' }]} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="object_name" label="Obyekt nomi" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="object_type" label="Obyekt sohasi" rules={[{ required: true }]}>
                        <Select options={[
                            { label: 'Ishlab chiqarish', value: 'PRODUCTION' },
                            { label: 'Umumiy ovqatlanish', value: 'CATERING' },
                            { label: 'Savdo', value: 'TRADE' },
                            { label: 'Bozor', value: 'MARKET' },
                            { label: 'Tuz korxonasi', value: 'ENT_SALT' },
                            { label: 'Un korxonasi', value: 'ENT_FLOUR' },
                        ]} />
                    </Form.Item>

                    {entryType === 'INSPECTION' ? (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="measure_type" label="Chora"><Select options={[{ label: 'Jarima', value: 'FINE' }, { label: 'To\'xtatish', value: 'STOP_OPERATION' }, { label: 'Yo\'q', value: 'NONE' }]} /></Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="fine_sum" label="Jarima summasi"><InputNumber style={{ width: '100%' }} /></Form.Item>
                            </Col>
                        </Row>
                    ) : (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="product_category" label="Mahsulot turi">
                                    <Select options={[
                                        { label: 'Go\'sht', value: 'meat_products' },
                                        { label: 'Sut', value: 'milk_products' },
                                        { label: 'Baliq', value: 'fish_products' },
                                        { label: 'Non', value: 'bread_products' },
                                    ]} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="lab_result" label="Natija"><Select options={[{ label: 'Mos', value: 'MEETS' }, { label: 'Nomos', value: 'NOT_MEETS' }]} /></Form.Item>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default MasterNutritionJournal;
