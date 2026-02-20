import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

interface PermissionGateProps {
    permission: string;
    action?: 'view' | 'edit' | 'download'; // UZ: Amal turini ko'rsatish
    children: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ permission, action = 'view', children }) => {
    const navigate = useNavigate();

    // 1. Check Admin override
    const userRole = localStorage.getItem('user_role');
    const isAdmin = ['ADMIN', 'REPUBLIC_HEAD'].includes(userRole || '');

    // UZ: Republik darajasi va Admin hamma narsani ko'rishi mumkin
    if (isAdmin) {
        return <>{children}</>;
    }

    // 2. Bo'lim ruxsatlarini tekshirish (Department)
    const deptPermsStr = localStorage.getItem('user_dept_permissions');
    let deptPerms: string[] = [];
    try {
        deptPerms = deptPermsStr ? JSON.parse(deptPermsStr) : [];
    } catch (e) {
        deptPerms = [];
    }

    const hasDeptPerm = deptPerms.includes(permission);

    // 3. Dinamik Rol ruxsatlarini tekshirish (Role)
    const rolePermsStr = localStorage.getItem('user_role_permissions');
    let rolePerms: any[] = [];
    try {
        rolePerms = rolePermsStr ? JSON.parse(rolePermsStr) : [];
    } catch (e) {
        rolePerms = [];
    }

    let hasRolePerm = true; // Agar rol biriktirilmagan bo'lsa, default true (bo'limga qoladi)

    const dynamicRoleExists = localStorage.getItem('user_role_permissions') !== null;
    if (dynamicRoleExists) {
        const rp = rolePerms.find((p: any) => p.permissionCode === permission);
        if (rp) {
            if (action === 'view') hasRolePerm = rp.canView || rp.canEdit;
            if (action === 'edit') hasRolePerm = rp.canEdit;
            if (action === 'download') hasRolePerm = rp.canDownload;
        } else {
            hasRolePerm = false; // Agar rol bor-u, lekin bu permission kodi yo'q bo'lsa - block
        }
    }

    // UZ: Qo'shma (Additive) mantiq - Agar Bo'lim ruxsat bersa YOKI Rol ruxsat bersa o'tkazadi
    if (hasDeptPerm || hasRolePerm) {
        return <>{children}</>;
    }

    // Fallback: Agar bu shunchaki ko'rish (view) bo'lsa, 403 Result ko'rsatsin, 
    // agar tugma yoki biron kichik element bo'lsa, shunchaki null qaytarsin.
    // Biz ko'pincha PermissionGate ni butun sahifa uchun ishlatamiz.
    // Biroq, komponentlar ichida null qaytargan ma'qul.

    // Check if we are at top-level content (Page level)
    const isTopLevel = permission.startsWith('VIEW_');

    if (isTopLevel && action === 'view') {
        return (
            <Result
                status="403"
                title="403"
                subTitle={
                    <div>
                        <p>Sizda ushbu sahifani ko'rish huquqi yo'q.</p>
                        <p style={{ fontSize: '12px', color: '#999' }}>
                            Kiritilgan ruxsat: <b>{permission}</b> |
                            Bo'lim: {hasDeptPerm ? '✅' : '❌'} |
                            Rol: {hasRolePerm ? '✅' : '❌'}
                        </p>
                    </div>
                }
                extra={<Button type="primary" onClick={() => navigate('/')}>Bosh sahifaga qaytish</Button>}
            />
        );
    }

    return null;
};

export default PermissionGate;
