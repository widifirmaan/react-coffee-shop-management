import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

export default function MenuPage() {
    const [menus, setMenus] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            setMenus(res.data);
        } catch (error) {
            console.error("Failed to fetch menus", error);
            // Mock data for demo if backend is down
            setMenus([
                { id: '1', name: 'Americano', price: 25000, category: 'Coffee', description: 'Strong black coffee', available: true },
                { id: '2', name: 'Latte', price: 30000, category: 'Coffee', description: 'Milky coffee', available: true },
                { id: '3', name: 'Croissant', price: 20000, category: 'Snack', description: 'Buttery pastry', available: true },
            ]);
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) {
                const newQ = i.quantity + delta;
                return newQ > 0 ? { ...i, quantity: newQ } : i;
            }
            return i;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const submitOrder = async () => {
        try {
            const orderPayload = {
                items: cart.map(i => ({ menuId: i.id, menuName: i.name, quantity: i.quantity, price: i.price })),
                totalAmount: total,
                tableNumber: "T1" // Hardcoded for demo
            };
            await axios.post('/api/orders', orderPayload);
            alert("ORDER SENT TO KITCHEN");
            setCart([]);
        } catch (e) {
            alert("FAILED TO ORDER");
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
            <div>
                <h1>MENU</h1>
                <div className="grid">
                    {menus.map(menu => (
                        <div key={menu.id} className="card">
                            <h3 style={{ marginBottom: '5px' }}>{menu.name}</h3>
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>{menu.category}</p>
                            <p>{menu.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span className="badge">Rp {menu.price.toLocaleString()}</span>
                                <button onClick={() => addToCart(menu)}>ADD +</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ShoppingCart />
                    <h2>CURRENT ORDER</h2>
                </div>

                {cart.length === 0 ? <p>CART EMPTY</p> : (
                    <div>
                        {cart.map(item => (
                            <div key={item.id} style={{ borderBottom: '2px solid black', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                    <div>Rp {item.price.toLocaleString()} x {item.quantity}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button style={{ padding: '5px 10px' }} onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                    <button style={{ padding: '5px 10px' }} onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                    <button style={{ padding: '5px 10px' }} className="danger" onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '20px', borderTop: '3px solid black', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                <span>TOTAL</span>
                                <span>Rp {total.toLocaleString()}</span>
                            </div>
                            <button className="primary" style={{ width: '100%', marginTop: '10px' }} onClick={submitOrder}>
                                PLACE ORDER
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
