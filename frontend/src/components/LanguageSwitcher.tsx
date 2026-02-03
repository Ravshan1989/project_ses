import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    // Map language codes to shorter labels or flags if needed
    const getLabel = (code: string) => {
        switch (code) {
            case 'uz_latn': return 'O\'z';
            case 'uz_cyrl': return 'Ўз';
            case 'ru': return 'Ru';
            case 'kaa': return 'Qar';
            case 'en': return 'En';
            default: return code;
        }
    };

    return (
        <Select
            defaultValue={i18n.language || 'uz_latn'}
            style={{ width: 70 }}
            bordered={false}
            onChange={changeLanguage}
            dropdownMatchSelectWidth={false}
            suffixIcon={<GlobalOutlined style={{ color: '#1890ff' }} />}
            value={i18n.language}
        >
            <Option value="uz_latn">{getLabel('uz_latn')}</Option>
            <Option value="uz_cyrl">{getLabel('uz_cyrl')}</Option>
            <Option value="ru">{getLabel('ru')}</Option>
            <Option value="kaa">{getLabel('kaa')}</Option>
            <Option value="en">{getLabel('en')}</Option>
        </Select>
    );
};

export default LanguageSwitcher;
