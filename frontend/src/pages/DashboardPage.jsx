import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package, ChefHat, AlertTriangle } from 'lucide-react';

export default function DashboardPage({ user }) {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalMenuItems: 0,
        totalEmployees: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersRes = await axios.get('/api/orders');
            const orders = ordersRes.data;

            // Calculate today's stats
            const today = new Date().toDateString();
            const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
            const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

            // Fetch menus
            const menusRes = await axios.get('/api/menus');
            const totalMenuItems = menusRes.data.length;

            // Fetch ingredients
            const ingredientsRes = await axios.get('/api/ingredients');
            const lowStockItems = ingredientsRes.data.filter(i => i.quantity < i.minThreshold).length;

            // Fetch employees
            const employeesRes = await axios.get('/api/employees');
            const totalEmployees = employeesRes.data.length;

            setStats({
                todayRevenue,
                todayOrders: todayOrders.length,
                pendingOrders,
                lowStockItems,
                totalMenuItems,
                totalEmployees
            });

            // Get recent orders (last 5)
            setRecentOrders(orders.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}><h2>LOADING DASHBOARD...</h2></div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>DASHBOARD</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Welcome back, {user.name || user.username}!</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Today Revenue */}
                <div className="card" style={{ background: 'var(--success-color)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>TODAY'S REVENUE</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>Rp {stats.todayRevenue.toLocaleString()}</h2>
                        </div>
                        <DollarSign size={40} />
                    </div>
                </div>

                {/* Today Orders */}
                <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>TODAY'S ORDERS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.todayOrders}</h2>
                        </div>
                        <ShoppingBag size={40} />
                    </div>
                </div>

                {/* Pending Orders */}
                <div className="card" style={{ background: 'var(--accent-color)', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>PENDING ORDERS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.pendingOrders}</h2>
                        </div>
                        <ChefHat size={40} />
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="card" style={{ background: stats.lowStockItems > 0 ? 'var(--danger-color)' : 'var(--neutral-color)', color: stats.lowStockItems > 0 ? 'white' : 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: stats.lowStockItems > 0 ? 0.9 : 0.7 }}>LOW STOCK ITEMS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.lowStockItems}</h2>
                        </div>
                        <AlertTriangle size={40} />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="card" style={{ background: 'var(--secondary-color)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>MENU ITEMS</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.totalMenuItems}</h2>
                        </div>
                        <Package size={40} />
                    </div>
                </div>

                {/* Total Employees */}
                <div className="card" style={{ background: 'var(--neutral-color)', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>TOTAL STAFF</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.totalEmployees}</h2>
                        </div>
                        <Users size={40} />
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={28} />
                    RECENT ORDERS
                </h2>
                {recentOrders.length === 0 ? (
                    <p style={{ opacity: 0.5, textAlign: 'center', padding: '40px' }}>NO RECENT ORDERS</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '4px solid black' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ORDER ID</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>CUSTOMER</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>TABLE</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ITEMS</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>TOTAL</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>STATUS</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '2px solid #e0e0e0' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{order.id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '15px' }}>{order.customerName}</td>
                                        <td style={{ padding: '15px' }}>{order.tableNumber}</td>
                                        <td style={{ padding: '15px' }}>{order.items.length} items</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>Rp {order.totalAmount.toLocaleString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span className={`badge ${order.status === 'COMPLETED' ? 'success' : order.status === 'PENDING' ? '' : 'danger'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', opacity: 0.7 }}>
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
