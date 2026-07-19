import React from 'react';

export const Card = ({ children, className = '', style = {}, title, icon: Icon, action, onClick, ...props }) => {
    return (
        <div
            onClick={onClick}
            className={`brutalist-card ${className}`}
            style={{
                background: 'white',
                border: '4px solid black',
                padding: '30px',
                boxShadow: '8px 8px 0 0 black',
                marginBottom: '30px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                ...style
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(-4px, -4px)';
                e.currentTarget.style.boxShadow = '12px 12px 0 0 black';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '8px 8px 0 0 black';
            }}
            onMouseDown={e => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translate(4px, 4px)';
                    e.currentTarget.style.boxShadow = '4px 4px 0 0 black';
                }
            }}
            onMouseUp={e => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translate(-4px, -4px)';
                    e.currentTarget.style.boxShadow = '12px 12px 0 0 black';
                }
            }}
            {...props}
        >
            {(title || Icon) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '4px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', margin: 0 }}>
                        {Icon && <Icon size={28} />}
                        {title}
                    </h2>
                    {action}
                </div>
            )}
            {children}
        </div>
    );
};
