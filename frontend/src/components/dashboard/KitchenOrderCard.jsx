import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { User, Hash, Edit2, Users } from 'lucide-react';

export const KitchenOrderCard = ({ order, onStatusChange, onEdit }) => {
    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PREPARING': return 'info';
            case 'READY_TO_SERVE': return 'success';
            case 'COMPLETED': return 'default';
            default: return 'default';
        }
    };

    return (
        <Card style={{ background: 'white', padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid black', paddingBottom: '15px', marginBottom: '15px' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold' }}>ORDER ID</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>#{order.id.substring(0, 8).toUpperCase()}</div>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                    {order.status.replace(/_/g, ' ')}
                </Badge>
            </div>

            {/* Customer Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f3f4f6', border: '2px solid black' }}>
                    <User size={20} />
                    <b style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customerName || 'Anon'}</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f3f4f6', border: '2px solid black' }}>
                    <Hash size={20} /> <b>{order.tableNumber}</b>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div style={{ marginBottom: '15px', background: '#fef3c7', padding: '15px', border: '2px dashed black' }}>
                    <b style={{ color: '#b45309' }}>⚠️ NOTES:</b> {order.notes}
                </div>
            )}

            {/* Items */}
            <div style={{ marginBottom: '15px' }}>
                {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                        <span><b>{item.quantity}x</b> {item.menuName}</span>
                    </div>
                ))}
            </div>

            {/* Staff Info */}
            {order.shiftStaff && (
                <div style={{ marginBottom: '15px', fontSize: '0.85rem', background: '#dbeafe', padding: '10px', border: '2px solid black' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}><Users size={16} /> STAFF:</div>
                    {Object.entries(order.shiftStaff).map(([role, name]) => name && (
                        <div key={role} style={{ textTransform: 'capitalize' }}>
                            {role.replace(/([A-Z])/g, ' $1')}: <b>{name}</b>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
                {order.status === 'PENDING' && (
                    <Button onClick={() => onStatusChange(order.id, 'PREPARING')} variant="primary" style={{ flex: 1 }}>
                        START PREP
                    </Button>
                )}
                {order.status === 'PREPARING' && (
                    <Button onClick={() => onStatusChange(order.id, 'READY_TO_SERVE')} variant="success" style={{ flex: 1 }}>
                        MARK READY
                    </Button>
                )}
                {order.status === 'READY_TO_SERVE' && (
                    <Button onClick={() => onStatusChange(order.id, 'COMPLETED')} variant="primary" style={{ flex: 1 }}>
                        MARK SERVED
                    </Button>
                )}
                <Button onClick={() => onEdit(order)} variant="secondary" style={{ background: '#fde68a' }}>
                    <Edit2 size={18} />
                </Button>
            </div>
        </Card>
    );
};
