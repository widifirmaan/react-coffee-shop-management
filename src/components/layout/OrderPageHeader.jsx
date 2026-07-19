import { Bell } from 'lucide-react';
import { Button } from '../ui/Button';

export default function OrderPageHeader({ shopConfig, onCallWaiter }) {
    return (
        <div style={{
            background: 'white',
            borderBottom: '4px solid black',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 40
        }}>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: '950',
                background: '#FCD34D', // accent-color
                padding: '5px 15px',
                border: '4px solid black',
                boxShadow: '4px 4px 0 0 black',
                transform: 'rotate(-2deg)',
                display: 'inline-block'
            }}>
                {shopConfig?.shopName || 'SIAP NYAFE'}
            </div>
            <Button variant="danger" onClick={onCallWaiter}>
                <Bell size={18} /> CALL WAITER
            </Button>
        </div>
    );
}
