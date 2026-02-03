import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Card, Row, Col, Statistic, Select, Input, Typography, Badge, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    FilterOutlined,
    DownloadOutlined,
    UploadOutlined
} from '@ant-design/icons';
// import { submissionApi } from '../../services/api';
import { Submission, SubmissionStatus } from '../../types';
import * as XLSX from 'xlsx';
import { Upload, UploadProps } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const DashboardPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // ... (REGION_DATA remains same) ...
    // Real Tashkent Region Districts Data
    const REGION_DATA = [
        { id: '1', name: 'Nurafshon shahri', population: 54100, type: 'Shahar' },
        { id: '2', name: 'Angren shahri', population: 191300, type: 'Shahar' },
        { id: '3', name: 'Bekobod shahri', population: 102000, type: 'Shahar' },
        { id: '4', name: 'Chirchiq shahri', population: 168000, type: 'Shahar' },
        { id: '5', name: 'Olmaliq shahri', population: 138500, type: 'Shahar' },
        { id: '6', name: 'Ohangaron shahri', population: 42000, type: 'Shahar' },
        { id: '7', name: 'Yangiyo‘l shahri', population: 63000, type: 'Shahar' },
        { id: '8', name: 'Oqqo‘rg‘on tumani', population: 112400, type: 'Tuman' },
        { id: '9', name: 'Ohangaron tumani', population: 108300, type: 'Tuman' },
        { id: '10', name: 'Bekobod tumani', population: 163400, type: 'Tuman' },
        { id: '11', name: 'Bo‘stonliq tumani', population: 175600, type: 'Tuman' },
        { id: '12', name: 'Bo‘ka tumani', population: 132400, type: 'Tuman' },
        { id: '13', name: 'Quyi Chirchiq tumani', population: 115800, type: 'Tuman' },
        { id: '14', name: 'Zangiota tumani', population: 204300, type: 'Tuman' },
        { id: '15', name: 'Yuqori Chirchiq tumani', population: 142100, type: 'Tuman' },
        { id: '16', name: 'Qibray tumani', population: 206800, type: 'Tuman' },
        { id: '17', name: 'Parkent tumani', population: 153000, type: 'Tuman' },
        { id: '18', name: 'Piskent tumani', population: 102400, type: 'Tuman' },
        { id: '19', name: 'O‘rta Chirchiq tumani', population: 153500, type: 'Tuman' },
        { id: '20', name: 'Chinoz tumani', population: 147800, type: 'Tuman' },
        { id: '21', name: 'Yangiyo‘l tumani', population: 278300, type: 'Tuman' },
        { id: '22', name: 'Toshkent tumani', population: 194500, type: 'Tuman' },
    ];

    // MOCK SUBMISSIONS mapped to real districts
    const MOCK_DATA: any[] = [
        {
            id: '1',
            template: { name: 'Yuqumli kasalliklar hisoboti (Shakl 1)' },
            organization: { name: 'Chirchiq shahri SES' },
            reportingPeriod: '2026-01-01',
            status: SubmissionStatus.SUBMITTED,
            data: { total_cases: 50 },
            createdAt: '2026-02-01'
        },
        {
            id: '2',
            template: { name: 'Emlash ishlari bo\'yicha oylik hisobot' },
            organization: { name: 'Bo‘stonliq tumani SES' },
            reportingPeriod: '2026-01-01',
            status: SubmissionStatus.APPROVED,
            data: { total_cases: 120 },
            createdAt: '2026-02-01'
        },
        {
            id: '3',
            template: { name: 'Suv sifati monitoringi' },
            organization: { name: 'Zangiota tumani SES' },
            reportingPeriod: '2026-01-15',
            status: SubmissionStatus.REJECTED,
            data: { total_samples: 45 },
            createdAt: '2026-02-02'
        },
        {
            id: '4',
            template: { name: 'Maktablardagi sanitariya holati' },
            organization: { name: 'Bekobod shahri SES' },
            reportingPeriod: '2026-02-01',
            status: SubmissionStatus.DRAFT,
            data: { total_samples: 45 },
            createdAt: '2026-02-02'
        }
    ];

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            // const res = await submissionApi.getAll();
            // setSubmissions(res.data);
            setTimeout(() => { // Simulate network delay
                setSubmissions(MOCK_DATA);
            }, 600);
        } catch (error) {
            message.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleAction = async (_id: string, action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT') {
            const reason = prompt('Rad etish sababi:');
            if (!reason) return;
            // await submissionApi.updateStatus(id, action, reason);
            message.success('Hisobot rad etildi');
        } else {
            // await submissionApi.updateStatus(id, action);
            message.success('Hisobot tasdiqlandi');
        }
        // fetchSubmissions(); // Refresh
    };

    // Excel Export
    const handleExport = () => {
        // Flatten data for Excel
        const dataToExport = submissions.map(s => ({
            ID: s.id,
            Hudud: s.organization.name,
            Hisobot_Turi: s.template.name,
            Davr: s.reportingPeriod,
            Holat: s.status,
            Yaratilgan_Sana: s.createdAt,
            // Simple way to dump the JSON data content
            Ma_lumotlar: JSON.stringify(s.data)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hisobotlar");
        XLSX.writeFile(wb, "RegionStat_Hisobotlar.xlsx");
        message.success('Excel fayl yuklab olindi');
    };

    // Excel Import
    const uploadProps: UploadProps = {
        name: 'file',
        accept: '.xlsx, .xls',
        showUploadList: false,
        beforeUpload: (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    console.log('Imported Data:', jsonData);

                    if (jsonData.length > 0) {
                        message.success(`${jsonData.length} ta yozuv muvaffaqiyatli o'qildi`);
                        // Logic to merge imported data would go here
                        // For demo, we just notify
                    } else {
                        message.warning('Fayl bo\'sh');
                    }
                } catch (error) {
                    message.error('Faylni o\'qishda xatolik bo\'ldi');
                }
            };
            reader.readAsBinaryString(file);
            return false; // Prevent default upload behavior
        },
    };

    // Derived Statistics
    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter(s => s.status === SubmissionStatus.SUBMITTED).length;
    const approvedSubmissions = submissions.filter(s => s.status === SubmissionStatus.APPROVED).length;
    const rejectedSubmissions = submissions.filter(s => s.status === SubmissionStatus.REJECTED).length;

    const filteredData = submissions.filter(item => {
        const matchesSearch = item.organization.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.template.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'Hudud',
            dataIndex: ['organization', 'name'],
            key: 'org',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Hisobot Turi',
            dataIndex: ['template', 'name'],
            key: 'template',
            render: (text: string) => <Text type="secondary">{text}</Text>
        },
        {
            title: 'Hisobot Davri',
            dataIndex: 'reportingPeriod',
            key: 'period',
        },
        {
            title: 'Holat',
            dataIndex: 'status',
            key: 'status',
            render: (status: SubmissionStatus) => {
                let color = 'default';
                let icon = null;

                switch (status) {
                    case SubmissionStatus.APPROVED:
                        color = 'success';
                        icon = <CheckCircleOutlined />;
                        break;
                    case SubmissionStatus.SUBMITTED:
                        color = 'processing';
                        icon = <ClockCircleOutlined />;
                        break;
                    case SubmissionStatus.REJECTED:
                        color = 'error';
                        icon = <CloseCircleOutlined />;
                        break;
                    case SubmissionStatus.DRAFT:
                        color = 'default';
                        icon = <FileTextOutlined />;
                        break;
                }

                return <Tag icon={icon} color={color} style={{ fontSize: '13px', padding: '4px 8px' }}>{status}</Tag>;
            }
        },
        {
            title: 'Amallar',
            key: 'action',
            render: (_: any, record: Submission) => (
                <Space size="small">
                    {record.status === SubmissionStatus.SUBMITTED && (
                        <>
                            <Tooltip title="Tasdiqlash">
                                <Button type="primary" shape="circle" icon={<CheckOutlined />} size="small" onClick={() => handleAction(record.id, 'APPROVE')} />
                            </Tooltip>
                            <Tooltip title="Rad etish">
                                <Button danger shape="circle" icon={<CloseOutlined />} size="small" onClick={() => handleAction(record.id, 'REJECT')} />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Batafsil ko'rish">
                        <Button shape="circle" icon={<EyeOutlined />} size="small" />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Jami hisobotlar"
                            value={totalSubmissions}
                            prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
                            valueStyle={{ fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Tasdiqlangan"
                            value={approvedSubmissions}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Ko'rib chiqilmoqda"
                            value={pendingSubmissions}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Rad etilgan"
                            value={rejectedSubmissions}
                            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Area */}
            <Row gutter={24}>
                {/* Left Column: Submissions Table */}
                <Col span={16}>
                    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <Title level={4} style={{ margin: 0 }}>Kelib tushgan hisobotlar</Title>
                            <Space>
                                <Input
                                    placeholder="Qidirish..."
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    style={{ width: 200 }}
                                    allowClear
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <Select
                                    placeholder="Holat"
                                    style={{ width: 120 }}
                                    allowClear
                                    onChange={setStatusFilter}
                                >
                                    {Object.values(SubmissionStatus).map(status => (
                                        <Option key={status} value={status}>{status}</Option>
                                    ))}
                                </Select>
                                <Button icon={<FilterOutlined />}>Filtr</Button>
                                <Button icon={<DownloadOutlined />} onClick={handleExport}>Excelga yuklash</Button>
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />}>Yuklash</Button>
                                </Upload>
                            </Space>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>

                {/* Right Column: Population Stats */}
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Title level={4} style={{ marginBottom: '16px' }}>Toshkent viloyati aholisi</Title>
                        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                            {REGION_DATA.sort((a, b) => b.population - a.population).map((item, index) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #f0f0f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#1677ff' : '#d9d9d9', boxShadow: 'none' }} />
                                        <div>
                                            <Text strong style={{ display: 'block' }}>{item.name}</Text>
                                            <Text type="secondary" style={{ fontSize: '11px' }}>{item.type}</Text>
                                        </div>
                                    </div>
                                    <Text strong>{item.population.toLocaleString()}</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
