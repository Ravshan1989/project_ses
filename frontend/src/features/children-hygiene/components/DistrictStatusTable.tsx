import React from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { thStyle, tdStyle, StatusDot } from './HygieneStyles';

interface DistrictStatusTableProps {
    loading: boolean;
    districts: any[];
    summary: any;
}

const DistrictStatusTable: React.FC<DistrictStatusTableProps> = ({ loading, districts, summary }) => {
    const { t } = useTranslation();

    return (
        <Spin spinning={loading}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ ...thStyle, textAlign: 'left', padding: '8px 12px' }}>{t('common.district_city')}</th>
                            <th style={thStyle}>1-jadval</th>
                            <th style={thStyle}>2-jadval</th>
                            <th style={thStyle}>3-jadval</th>
                            <th style={thStyle}>3.1-jadval</th>
                            <th style={thStyle}>3.2-jadval</th>
                            <th style={thStyle}>4-jadval</th>
                            <th style={thStyle}>Tekshirilgan</th>
                            <th style={thStyle}>Tahlillar</th>
                            <th style={thStyle}>Mos emas</th>
                            <th style={thStyle}>Muvofiqlik</th>
                        </tr>
                    </thead>
                    <tbody>
                        {districts.map((row: any) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ ...tdStyle, textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>{row.name}</td>
                                <td style={tdStyle}><StatusDot on={row.t1} label="Jadval-1" /></td>
                                <td style={tdStyle}><StatusDot on={row.t2} label="Jadval-2" /></td>
                                <td style={tdStyle}><StatusDot on={row.t3} label="Jadval-3" /></td>
                                <td style={tdStyle}><StatusDot on={row.t31} label="Jadval-3.1" /></td>
                                <td style={tdStyle}><StatusDot on={row.t32} label="Jadval-3.2" /></td>
                                <td style={tdStyle}><StatusDot on={row.t4} label="Jadval-4" /></td>
                                <td style={tdStyle}>{row.inspectedInstitutions}</td>
                                <td style={tdStyle}>{row.totalTests}</td>
                                <td style={{ ...tdStyle, color: row.nonCompliantTests > 0 ? '#ef4444' : '#111', fontWeight: row.nonCompliantTests > 0 ? 700 : 400 }}>{row.nonCompliantTests}</td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: Number(row.compliancePct) < 90 ? '#ef4444' : '#16a34a' }}>
                                    {row.compliancePct}%
                                </td>
                            </tr>
                        ))}
                        {districts.length === 0 && !loading && (
                            <tr><td colSpan={11} style={{ ...tdStyle, padding: 24, color: '#94a3b8' }}>{t('common.no_data')}</td></tr>
                        )}
                        {districts.length > 0 && (
                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                <td style={{ ...tdStyle, textAlign: 'right', padding: '8px 12px' }} colSpan={7}>{t('common.total')}:</td>
                                <td style={tdStyle}>{summary.inspectedInstitutions ?? 0}</td>
                                <td style={tdStyle}>{summary.totalTests ?? 0}</td>
                                <td style={{ ...tdStyle, color: '#ef4444' }}>{summary.nonCompliantTests ?? 0}</td>
                                <td style={{ ...tdStyle, color: '#16a34a' }}>{summary.compliancePct ?? '100.0'}%</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Spin>
    );
};

export default DistrictStatusTable;
