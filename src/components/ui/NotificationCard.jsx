import React from 'react';
import { Clock, Check } from 'lucide-react';
import { Button } from './Button';

export const NotificationCard = ({ notification, onDismiss }) => {
    // Format timestamp
    const timestamp = notification.timestamp || notification.createdAt;
    const timeString = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const isPayment = notification.message?.toLowerCase().includes('bill') || notification.message?.toLowerCase().includes('payment');
    const isAssistance = notification.message?.toLowerCase().includes('assistance');

    const bgColor = isPayment ? '#86efac' : (isAssistance ? '#fde047' : 'white');

    return (
        <div style={{
            background: bgColor,
            border: '4px solid black',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '8px 8px 0 0 black',
            marginBottom: '20px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                        background: '#ef4444',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '5px 10px',
                        border: '2px solid black',
                        whiteSpace: 'nowrap'
                    }}>
                        {notification.tableNumber || 'UNKNOWN TABLE'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                        <Clock size={16} /> {timeString}
                    </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>
                    {notification.type === 'CALL_WAITER' ? 'WAITRESS NEEDED' : notification.type}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{notification.message}</p>
            </div>

            <div style={{ marginLeft: '20px' }}>
                <button
                    onClick={() => onDismiss(notification.id)}
                    style={{
                        background: '#22c55e', // Green
                        color: 'black',
                        border: '3px solid black',
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '4px 4px 0 0 black',
                        transition: 'transform 0.1s, box-shadow 0.1s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translate(-2px, -2px)';
                        e.currentTarget.style.boxShadow = '6px 6px 0 0 black';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translate(0, 0)';
                        e.currentTarget.style.boxShadow = '4px 4px 0 0 black';
                    }}
                    onMouseDown={e => {
                        e.currentTarget.style.transform = 'translate(2px, 2px)';
                        e.currentTarget.style.boxShadow = '2px 2px 0 0 black';
                    }}
                    onMouseUp={e => {
                        e.currentTarget.style.transform = 'translate(-2px, -2px)';
                        e.currentTarget.style.boxShadow = '6px 6px 0 0 black';
                    }}
                    title="Mark as Done"
                >
                    <Check size={40} strokeWidth={4} />
                </button>
            </div>
        </div >
    );
};
