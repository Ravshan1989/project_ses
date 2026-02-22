import React from 'react';
import { Tooltip } from 'antd';

export const thStyle: React.CSSProperties = {
    border: '1px solid #d1d5db',
    padding: '4px 6px',
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    verticalAlign: 'middle',
    background: '#f8fafc',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    lineHeight: 1.3,
};

export const tdStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    padding: '2px 4px',
    fontSize: 10,
    textAlign: 'center',
    verticalAlign: 'middle',
    minWidth: 40,
};

export const StatusDot: React.FC<{ on: boolean; label: string }> = ({ on, label }) => (
    <Tooltip title={on ? `${label}: Yuborilgan ✓` : `${label}: Yuborilmagan`}>
        <span style={{
            display: 'inline-block', width: 11, height: 11, borderRadius: '50%',
            backgroundColor: on ? '#22c55e' : '#ef4444',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)', cursor: 'default',
        }} />
    </Tooltip>
);
