import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, Select, Space, Spin, Card, Tabs } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import GlassLayout from '../../components/layout/GlassLayout';
import PermissionGate from '../../components/PermissionGate';
import EditCell from '../../components/common/EditCell';
import { useNutritionHygieneData } from './hooks/useNutritionHygieneData';
import { NUTRITION_HYGIENE_T3_PRODUCTS, NUTRITION_HYGIENE_DEFAULT_ROWS } from './components/NutritionHygieneConstants';

interface Organization {
    id: string;
    name: string;
}

const thStyle: React.CSSProperties = {
    background: '#f1f5f9',
    padding: '12px 6px',
    border: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: 600,
    color: '#475569',
    textAlign: 'center',
    minWidth: '50px'
};

const tdStyle: React.CSSProperties = {
    padding: '4px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
};

const NutritionHygienePage: React.FC = () => {
    const { t } = useTranslation();
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('1');

    const isAdmin = localStorage.getItem('user_role') === 'ADMIN' || localStorage.getItem('user_role') === 'EXECUTIVE';
    const userOrgId = localStorage.getItem('user_org_id');
    const effectiveOrgId = isAdmin ? selectedOrgId : userOrgId;

    const {
        organizations,
        tableData,
        isLoadingTable,
        isSaving,
        saveData,
        refresh
    } = useNutritionHygieneData(month, effectiveOrgId, activeTab);

    const [localData, setLocalData] = useState<any[]>([]);

    useEffect(() => {
        setLocalData(tableData);
    }, [tableData]);

    const updateCell = (rowKey: string, field: string, val: number) => {
        setLocalData(prev => {
            const idx = prev.findIndex(r => r.row_key === rowKey);
            if (idx === -1) {
                return [...prev, { row_key: rowKey, [field]: val }];
            }
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    const getVal = (rowKey: string, field: string): number => {
        return localData.find(r => r.row_key === rowKey)?.[field] || 0;
    };

    const renderTable4 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} colSpan={3}>Korxonalar</th>
                    <th style={thStyle} colSpan={2}>Dispenserlar</th>
                    <th style={thStyle} rowSpan={2}>Kali iodat qoldig'i (kg)</th>
                    <th style={thStyle} colSpan={2}>Lab. (I.Ch.)</th>
                    <th style={thStyle} colSpan={2}>Lab. (S/O)</th>
                    <th style={thStyle} colSpan={2}>Lab. (Boshqa)</th>
                    <th style={thStyle} colSpan={4}>Choralar</th>
                </tr>
                <tr>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Davr</th><th style={thStyle}>Lab</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Davr</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Nomu.</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Nomu.</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Nomu.</th>
                    <th style={thStyle}>To'xta. kg</th><th style={thStyle}>To'x. soni</th><th style={thStyle}>Protokol</th><th style={thStyle}>Prokur.</th>
                </tr>
            </thead>
            <tbody>
                {NUTRITION_HYGIENE_DEFAULT_ROWS.map((row, ridx) => (
                    <tr key={row.key}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Tuman hisoboti</td>
                        {[
                            'ent_total', 'ent_period', 'ent_covered_lab', 'dispensers_total', 'dispensers_period',
                            'potassium_iodate_kg', 'samples_prod_total', 'samples_prod_not_meet', 'samples_trade_total',
                            'samples_trade_not_meet', 'samples_others_total', 'samples_others_not_meet',
                            'sales_suspended_amount', 'operation_stopped', 'protocols_count', 'sent_to_prosecutor'
                        ].map((f, fidx) => (
                            <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTable5 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} colSpan={3}>Korxonalar</th>
                    <th style={thStyle} colSpan={2}>Dispenserlar</th>
                    <th style={thStyle} rowSpan={2}>Premiks qoldig'i (kg)</th>
                    <th style={thStyle} colSpan={2}>Lab. (I.Ch.)</th>
                    <th style={thStyle} colSpan={2}>Lab. (S/O)</th>
                    <th style={thStyle} colSpan={2}>Lab. (Boshqa)</th>
                    <th style={thStyle} colSpan={4}>Choralar</th>
                </tr>
                <tr>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Davr</th><th style={thStyle}>Lab</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Davr</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Nomu.</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Nomu.</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Nomu.</th>
                    <th style={thStyle}>To'xta. tn</th><th style={thStyle}>To'x. soni</th><th style={thStyle}>Protokol</th><th style={thStyle}>Prokur.</th>
                </tr>
            </thead>
            <tbody>
                {NUTRITION_HYGIENE_DEFAULT_ROWS.map((row, ridx) => (
                    <tr key={row.key}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Tuman hisoboti</td>
                        {[
                            'ent_total', 'ent_period', 'ent_covered_lab', 'dispensers_total', 'dispensers_period',
                            'premix_amount_kg', 'samples_prod_total', 'samples_prod_not_meet', 'samples_trade_total',
                            'samples_trade_not_meet', 'samples_others_total', 'samples_others_not_meet',
                            'sales_suspended_amount_tn', 'operation_stopped', 'protocols_count', 'sent_to_prosecutor'
                        ].map((f, fidx) => (
                            <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTable6 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} rowSpan={2}>Ishlayotgan bozorlar</th>
                    <th style={thStyle} colSpan={8}>Kamchiliklar</th>
                    <th style={thStyle} rowSpan={2}>Tekshiruvlar</th>
                    <th style={thStyle} rowSpan={2}>Kamchilik aniql.</th>
                    <th style={thStyle} rowSpan={2}>Sudga</th>
                    <th style={thStyle} colSpan={2}>Jarima (S/O)</th>
                    <th style={thStyle} rowSpan={2}>Faoliyat to'xt.</th>
                    <th style={thStyle} rowSpan={2}>Chetlatish taklif</th>
                    <th style={thStyle} rowSpan={2}>Chetlatilgan xodim</th>
                    <th style={thStyle} rowSpan={2}>Brakeraj (kg)</th>
                </tr>
                <tr>
                    <th style={thStyle}>Suv</th><th style={thStyle}>Oqova</th><th style={thStyle}>Go'sht pav.</th><th style={thStyle}>Sut pav.</th>
                    <th style={thStyle}>VS'E</th><th style={thStyle}>Xojat.</th><th style={thStyle}>Chiqind.</th><th style={thStyle}>Dezin.</th>
                    <th style={thStyle}>Soni</th><th style={thStyle}>Summa</th>
                </tr>
            </thead>
            <tbody>
                {NUTRITION_HYGIENE_DEFAULT_ROWS.map((row, ridx) => (
                    <tr key={row.key}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Tuman hisoboti</td>
                        {[
                            'operating_markets', 'no_water', 'no_sewage', 'no_meat_pavilion', 'no_milk_pavilion',
                            'no_vse_lab', 'no_toilet', 'no_waste_area', 'no_disinfection_contract', 'inspections_total',
                            'violations_found', 'court_cases', 'fine_individual_count', 'fine_individual_sum',
                            'suspension_count', 'dismissal_proposals', 'dismissed_employees', 'brake_food_kg'
                        ].map((f, fidx) => (
                            <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTable1 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} colSpan={3}>Xabardor etish</th>
                    <th style={thStyle} rowSpan={2}>Ruxsat buyurtma</th>
                    <th style={thStyle} rowSpan={2}>Jami ruxsat</th>
                    <th style={thStyle} rowSpan={2}>Sudga</th>
                    <th style={thStyle} rowSpan={2}>Prokuraturaga</th>
                    <th style={thStyle} colSpan={2}>Sud jarimasi</th>
                    <th style={thStyle} colSpan={2}>Undirilgan (Sud)</th>
                    <th style={thStyle} colSpan={2}>Sanepid jarima</th>
                    <th style={thStyle} colSpan={2}>Undirilgan (Sanepid)</th>
                    <th style={thStyle} rowSpan={2}>Faoliyat to'xt.</th>
                    <th style={thStyle} rowSpan={2}>Chetlatish taklif</th>
                    <th style={thStyle} rowSpan={2}>Chetlatilgan xodim</th>
                </tr>
                <tr>
                    <th style={thStyle}>I.Ch.</th><th style={thStyle}>Ovqat.</th><th style={thStyle}>Savdo</th>
                    <th style={thStyle}>Soni</th><th style={thStyle}>Summa</th>
                    <th style={thStyle}>Soni</th><th style={thStyle}>Summa</th>
                    <th style={thStyle}>Soni</th><th style={thStyle}>Summa</th>
                    <th style={thStyle}>Soni</th><th style={thStyle}>Summa</th>
                </tr>
            </thead>
            <tbody>
                {NUTRITION_HYGIENE_DEFAULT_ROWS.map((row, ridx) => (
                    <tr key={row.key}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{t(row.labelKey)}</td>
                        {[
                            'production_notif', 'catering_notif', 'trade_notif', 'order_permission', 'total_permission',
                            'sent_to_court', 'sent_to_prosecutor', 'court_fine_count', 'court_fine_sum',
                            'recovered_fine_count', 'recovered_fine_sum', 'sanitary_fine_count', 'sanitary_fine_sum',
                            'sanitary_recovered_count', 'sanitary_recovered_sum', 'suspension_count',
                            'dismissal_proposals', 'dismissed_employees'
                        ].map((f, fidx) => (
                            <td key={f} style={tdStyle}>
                                <EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTable2 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} colSpan={4}>I.Ch. ob'ektlari</th>
                    <th style={thStyle} colSpan={4}>Umumiy ovqat.</th>
                    <th style={thStyle} colSpan={4}>Savdo ob'ektlari</th>
                    <th style={thStyle} colSpan={3}>Choralar</th>
                </tr>
                <tr>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Kerek</th><th style={thStyle}>O'tdi</th><th style={thStyle}>%</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Kerek</th><th style={thStyle}>O'tdi</th><th style={thStyle}>%</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Kerek</th><th style={thStyle}>O'tdi</th><th style={thStyle}>%</th>
                    <th style={thStyle}>Taklif</th><th style={thStyle}>Chetla.</th><th style={thStyle}>Protokol</th>
                </tr>
            </thead>
            <tbody>
                {NUTRITION_HYGIENE_DEFAULT_ROWS.map((row, ridx) => {
                    const prodP = getVal(row.key, 'production_required') ? (getVal(row.key, 'production_passed') / getVal(row.key, 'production_required') * 100).toFixed(1) : '0';
                    const catP = getVal(row.key, 'catering_required') ? (getVal(row.key, 'catering_passed') / getVal(row.key, 'catering_required') * 100).toFixed(1) : '0';
                    const tradeP = getVal(row.key, 'trade_required') ? (getVal(row.key, 'trade_passed') / getVal(row.key, 'trade_required') * 100).toFixed(1) : '0';
                    return (
                        <tr key={row.key}>
                            <td style={{ ...tdStyle, fontWeight: 'bold' }}>{t(row.labelKey)}</td>
                            {[
                                'production_total', 'production_required', 'production_passed'
                            ].map((f, fidx) => (
                                <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} /></td>
                            ))}
                            <td style={tdStyle}>{prodP}%</td>
                            {[
                                'catering_total', 'catering_required', 'catering_passed'
                            ].map((f, fidx) => (
                                <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx + 3} disabled={isSaving} /></td>
                            ))}
                            <td style={tdStyle}>{catP}%</td>
                            {[
                                'trade_total', 'trade_required', 'trade_passed'
                            ].map((f, fidx) => (
                                <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx + 6} disabled={isSaving} /></td>
                            ))}
                            <td style={tdStyle}>{tradeP}%</td>
                            {[
                                'dismissal_proposals', 'dismissed_employees', 'health_protocols'
                            ].map((f, fidx) => (
                                <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx + 9} disabled={isSaving} /></td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const renderTable3 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} colSpan={13}>Mahsulotlar (tn)</th>
                    <th style={thStyle} rowSpan={2}>Jami namunalar</th>
                    <th style={thStyle} colSpan={3}>Savdo tarmog'ida</th>
                    <th style={thStyle} colSpan={3}>S.T. (Xorijiy)</th>
                </tr>
                <tr>
                    {NUTRITION_HYGIENE_T3_PRODUCTS.map(p => <th key={p.key} style={thStyle}>{t(p.labelKey)}</th>)}
                    <th style={thStyle}>Jami</th>
                    <th style={thStyle}>Namuna</th><th style={thStyle}>Miqdor</th><th style={thStyle}>Muddati o't.</th>
                    <th style={thStyle}>Namuna</th><th style={thStyle}>Miqdor</th><th style={thStyle}>Muddati o't.</th>
                </tr>
            </thead>
            <tbody>
                {NUTRITION_HYGIENE_DEFAULT_ROWS.map((row, ridx) => (
                    <tr key={row.key}>
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>Tuman hisoboti</td>
                        {NUTRITION_HYGIENE_T3_PRODUCTS.map((p, fidx) => (
                            <td key={p.key} style={tdStyle}><EditCell value={getVal(row.key, p.key)} onChange={v => updateCell(row.key, p.key, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} /></td>
                        ))}
                        {[
                            'total_amount', 'total_samples', 'trade_lab_samples', 'trade_lab_amount', 'trade_expired_amount',
                            'trade_foreign_lab_samples', 'trade_foreign_lab_amount', 'trade_foreign_expired_amount'
                        ].map((f, fidx) => (
                            <td key={f} style={tdStyle}><EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx + 13} disabled={isSaving} /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const tabItems = [
        { key: '1', label: t('nutrition.tabs.t1'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable1()}</div></Spin> },
        { key: '2', label: t('nutrition.tabs.t2'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable2()}</div></Spin> },
        { key: '3', label: t('nutrition.tabs.t3'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable3()}</div></Spin> },
        { key: '4', label: t('nutrition.tabs.t4'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable4()}</div></Spin> },
        { key: '5', label: t('nutrition.tabs.t5'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable5()}</div></Spin> },
        { key: '6', label: t('nutrition.tabs.t6'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable6()}</div></Spin> },
    ];

    return (
        <GlassLayout title={t('nutrition.title')}>
            <style dangerouslySetInnerHTML={{ __html: `.table-container { overflow-x: auto; background: #fff; border-radius: 8px; padding: 10px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }` }} />
            <Card style={{ marginBottom: 20 }} size="small" className="glass-card">
                <Space wrap>
                    <DatePicker
                        picker="month"
                        value={dayjs(month)}
                        onChange={(d) => setMonth(d ? d.format('YYYY-MM') : dayjs().format('YYYY-MM'))}
                        allowClear={false}
                    />
                    {isAdmin && (
                        <Select
                            placeholder={t('admin.organizations.select_org')}
                            style={{ width: 250 }}
                            value={selectedOrgId}
                            onChange={setSelectedOrgId}
                            options={organizations.map((o: Organization) => ({ label: o.name, value: o.id }))}
                            showSearch
                            allowClear
                        />
                    )}
                    <Button icon={<ReloadOutlined />} onClick={refresh} loading={isLoadingTable}>
                        {t('common.refresh')}
                    </Button>

                    <PermissionGate permission="EDIT_NUTRITION_HYGIENE">
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveData(localData)} loading={isSaving}>
                            {t('common.save')}
                        </Button>
                    </PermissionGate>
                </Space>
            </Card>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="glass-tabs"
                items={tabItems}
                destroyInactiveTabPane
            />
        </GlassLayout>
    );
};

export default NutritionHygienePage;
