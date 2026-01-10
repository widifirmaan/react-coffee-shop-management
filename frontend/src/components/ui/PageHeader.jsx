import React from 'react';

export default function PageHeader({ title, description, icon: Icon, color = 'white', action }) {
    return (
        <div className="page-header-container" style={{
            background: color,
            border: '4px solid black',
            boxShadow: '8px 8px 0 0 black',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
        }}>
            <div>
                <h1 className="page-header-title" style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    textTransform: 'uppercase',
                    lineHeight: 1
                }}>
                    {Icon && <Icon size={48} className="page-header-icon" strokeWidth={2.5} />}
                    {title}
                </h1>
                {description && (
                    <p className="page-header-desc" style={{
                        margin: '10px 0 0 0',
                        fontWeight: 'bold',
                        opacity: 0.7,
                        fontFamily: 'monospace'
                    }}>
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
