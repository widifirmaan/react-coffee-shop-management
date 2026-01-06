import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InventoryPage() {
    const [ingredients, setIngredients] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: '', minThreshold: 0 });

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const res = await axios.get('/api/ingredients');
            setIngredients(res.data);
        } catch (e) {
            console.error("Fetch ingredients failed", e);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/ingredients', newItem);
            setNewItem({ name: '', quantity: 0, unit: '', minThreshold: 0 });
            fetchIngredients();
        } catch (e) {
            alert("Error adding ingredient");
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
                <h1>INVENTORY / STOCK</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Min Level</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map(ing => (
                            <tr key={ing.id}>
                                <td>{ing.name}</td>
                                <td>{ing.quantity}</td>
                                <td>{ing.unit}</td>
                                <td>{ing.minThreshold}</td>
                                <td>
                                    {ing.quantity < ing.minThreshold ?
                                        <span style={{ color: 'red', fontWeight: 'bold' }}>LOW STOCK</span> :
                                        <span style={{ color: 'green' }}>OK</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3>ADD NEW STOCK</h3>
                <form onSubmit={handleAdd}>
                    <label>Item Name</label>
                    <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />

                    <label>Quantity</label>
                    <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })} required />

                    <label>Unit</label>
                    <input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="kg, pcs, etc" required />

                    <label>Min Threshold</label>
                    <input type="number" value={newItem.minThreshold} onChange={e => setNewItem({ ...newItem, minThreshold: parseFloat(e.target.value) })} required />

                    <button className="primary" style={{ width: '100%' }}>ADD ITEM</button>
                </form>
            </div>
        </div>
    );
}
