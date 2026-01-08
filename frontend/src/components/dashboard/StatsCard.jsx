export const StatsCard = ({ title, value, icon: Icon, color, textColor = 'white' }) => {
    return (
        <div className="card" style={{ background: color, color: textColor }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: textColor === 'white' ? 0.9 : 0.7 }}>{title}</p>
                    <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                        {typeof value === 'number' && title.includes('REVENUE') ? `Rp ${value.toLocaleString()}` : value}
                    </h2>
                </div>
                <Icon size={40} />
            </div>
        </div>
    );
};
