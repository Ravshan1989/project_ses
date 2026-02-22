import React from 'react';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

interface IndicatorCardsProps {
    summary: {
        inspectedInstitutions?: number;
        totalTests?: number;
        nonCompliantTests?: number;
        compliancePct?: string;
        fineCount?: number;
    };
}

const IndicatorCards: React.FC<IndicatorCardsProps> = ({ summary }) => {
    const { t } = useTranslation();

    const cardStyle: React.CSSProperties = {
        borderRadius: 10,
        textAlign: 'center',
        flex: '1 1 200px',
        minWidth: 160,
        border: 'none',
        color: '#fff',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
    };

    const valueStyle: React.CSSProperties = {
        fontSize: 28,
        fontWeight: 800,
        color: '#fff',
    };

    return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <Card style={{ ...cardStyle, background: 'linear-gradient(135deg,#0ea5e9,#3b82f6)' }}>
                <div style={labelStyle}>{t('children_hygiene.indicators.inspected_institutions')}</div>
                <div style={valueStyle}>{summary.inspectedInstitutions ?? 0}</div>
            </Card>
            <Card style={{ ...cardStyle, background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                <div style={labelStyle}>{t('children_hygiene.indicators.total_tests')}</div>
                <div style={valueStyle}>{summary.totalTests ?? 0}</div>
            </Card>
            <Card style={{ ...cardStyle, background: 'linear-gradient(135deg,#dc2626,#f87171)' }}>
                <div style={labelStyle}>{t('children_hygiene.indicators.non_compliant')}</div>
                <div style={valueStyle}>{summary.nonCompliantTests ?? 0}</div>
            </Card>
            <Card style={{ ...cardStyle, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
                <div style={labelStyle}>{t('children_hygiene.indicators.compliance_pct')}</div>
                <div style={valueStyle}>{summary.compliancePct ?? '100.0'}%</div>
            </Card>
            <Card style={{ ...cardStyle, background: 'linear-gradient(135deg,#d97706,#fbbf24)' }}>
                <div style={labelStyle}>{t('children_hygiene.indicators.total_fines')}</div>
                <div style={valueStyle}>{summary.fineCount ?? 0}</div>
            </Card>
        </div>
    );
};

export default IndicatorCards;
