import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FinancePage() {
    const [transactions, setTransactions] = useState([]);
    const [newTrans, setNewTrans] = useState({ type: 'EXPENSE', amount: 0, description: '' });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('/api/transactions');
            setTransactions(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/transactions', newTrans);
            setNewTrans({ type: 'EXPENSE', amount: 0, description: '' });
            fetchTransactions();
        } catch (e) {
            alert("Error");
        }
    };

    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const profit = income - expense;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
                <h1>FINANCIAL RECORDS</h1>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                        <h3>INCOME</h3>
                        <p style={{ color: 'green', fontSize: '1.5rem', fontWeight: 'bold' }}>+ Rp {income.toLocaleString()}</p>
                    </div>
                    <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                        <h3>EXPENSE</h3>
                        <p style={{ color: 'red', fontSize: '1.5rem', fontWeight: 'bold' }}>- Rp {expense.toLocaleString()}</p>
                    </div>
                    <div className="card" style={{ flex: 1, textAlign: 'center', background: profit >= 0 ? '#ccffcc' : '#ffcccc' }}>
                        <h3>NET PROFIT</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Rp {profit.toLocaleString()}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleString()}</td>
                                <td>{t.description}</td>
                                <td>
                                    <span className="badge" style={{
                                        backgroundColor: t.type === 'INCOME' ? 'green' : 'red',
                                        color: 'white',
                                        borderColor: 'black'
                                    }}>
                                        {t.type}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    Rp {t.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
                <h3>RECORD TRANSACTION</h3>
                <form onSubmit={handleAdd}>
                    <label>Type</label>
                    <select value={newTrans.type} onChange={e => setNewTrans({ ...newTrans, type: e.target.value })}>
                        <option value="EXPENSE">Expense (Pengeluaran)</option>
                        <option value="INCOME">Income (Pemasukan Manual)</option>
                    </select>

                    <label>Description</label>
                    <input value={newTrans.description} onChange={e => setNewTrans({ ...newTrans, description: e.target.value })} placeholder="e.g. Buy Milk, Salary" required />

                    <label>Amount (Rp)</label>
                    <input type="number" value={newTrans.amount} onChange={e => setNewTrans({ ...newTrans, amount: parseFloat(e.target.value) })} required />

                    <button className={newTrans.type === 'EXPENSE' ? 'danger' : 'primary'} style={{ width: '100%' }}>
                        {newTrans.type === 'EXPENSE' ? 'RECORD EXPENSE' : 'RECORD INCOME'}
                    </button>
                </form>
            </div>
        </div>
    );
}
