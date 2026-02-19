import React from 'react';
import { Modal, Typography, Button, Steps } from 'antd';
import { AppleOutlined, ShareAltOutlined, PlusSquareOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface IosInstallGuideModalProps {
    visible: boolean;
    onClose: () => void;
}

const IosInstallGuideModal: React.FC<IosInstallGuideModalProps> = ({ visible, onClose }) => {
    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AppleOutlined style={{ fontSize: '24px', color: '#000' }} />
                    <span>iOS (iPhone/iPad) ga o'rnatish</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" type="primary" onClick={onClose} style={{ borderRadius: '8px' }}>
                    Tushunarli
                </Button>
            ]}
            centered
            width={500}
            bodyStyle={{ padding: '24px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Text style={{ fontSize: '16px', color: '#595959' }}>
                    Ilovani iPhone yoki iPad ekraniga o'rnatish uchun quyidagi qadamlarni bajaring:
                </Text>
            </div>

            <Steps
                direction="vertical"
                current={-1}
                items={[
                    {
                        title: 'Safari-ni oching',
                        description: 'Ushbu saytni Safari brauzerida oching.',
                        icon: <div style={{ background: '#1890ff', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                    },
                    {
                        title: 'Ulashish (Share) tugmasini bosing',
                        description: 'Ekran pastki qismidagi "Ulashish" belgisini toping va bosing.',
                        icon: <ShareAltOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    },
                    {
                        title: '"Asosiy ekranga" (Add to Home Screen)',
                        description: 'Menyudan pastroqqa tushib "Asosiy ekranga qo\'shish" ni tanlang.',
                        icon: <PlusSquareOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    },
                    {
                        title: 'Tasdiqlang',
                        description: 'O\'ng tepa burchakdagi "Qo\'shish" (Add) tugmasini bosing.',
                        icon: <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                    }
                ]}
            />

            <div style={{ marginTop: '24px', background: '#f5f5f5', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <Text strong style={{ color: '#1f1f1f' }}>Natija:</Text><br />
                <Text type="secondary">Ilova sizning ekraringizda paydo bo'ladi va xuddi mobil ilova kabi ishlaydi.</Text>
            </div>
        </Modal>
    );
};

export default IosInstallGuideModal;
