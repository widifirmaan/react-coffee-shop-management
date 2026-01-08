import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';

export default function FinancePage() {
    const [transactions, setTransactions] = useState([]);
    const [newTrans, setNewTrans] = useState({ type: 'EXPENSE', amount: 0, description: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            setIsModalOpen(false);
            fetchTransactions();
        } catch (e) {
            alert("Error");
        }
    };

    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const profit = income - expense;

    // Search and Pagination
    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <PageHeader
                title="FINANCIAL"
                description="PROFIT & LOSS TRACKER"
                icon={DollarSign}
                color="#d1fae5"
                action={
                    <Button onClick={() => setIsModalOpen(true)} variant="primary" style={{ padding: '15px 30px', fontSize: '1.2rem' }}>
                        <Plus /> RECORD TRANSACTION
                    </Button>
                }
            />

            {/* Search */}
            <div style={{ marginBottom: '30px' }}>
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="SEARCH TRANSACTIONS..."
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <Card style={{ background: '#f0fdf4', textAlign: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><TrendingUp size={24} /> INCOME</h3>
                    <p style={{ color: '#16a34a', fontSize: '2.5rem', fontWeight: '900', margin: '10px 0' }}>+ {income.toLocaleString()}</p>
                </Card>
                <Card style={{ background: '#fef2f2', textAlign: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><TrendingDown size={24} /> EXPENSE</h3>
                    <p style={{ color: '#dc2626', fontSize: '2.5rem', fontWeight: '900', margin: '10px 0' }}>- {expense.toLocaleString()}</p>
                </Card>
                <Card style={{ background: profit >= 0 ? '#dcfce7' : '#fee2e2', textAlign: 'center', border: '4px solid black' }}>
                    <h3>NET PROFIT</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: '900', margin: '10px 0' }}>{profit.toLocaleString()}</p>
                </Card>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'black', color: 'white' }}>
                        <tr>
                            {['DATE', 'DESCRIPTION', 'TYPE', 'AMOUNT'].map(h => <th key={h} style={{ padding: '20px' }}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((t, i) => (
                            <tr key={t.id} style={{ background: i % 2 ? 'white' : '#f9fafb', borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '20px' }}>{new Date(t.date).toLocaleDateString()}</td>
                                <td style={{ padding: '20px', fontWeight: 'bold' }}>{t.description}</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{
                                        background: t.type === 'INCOME' ? '#dcfce7' : '#fee2e2',
                                        color: t.type === 'INCOME' ? '#166534' : '#991b1b',
                                        padding: '5px 10px', fontWeight: 'bold', border: '2px solid black', fontSize: '0.8rem'
                                    }}>
                                        {t.type}
                                    </span>
                                </td>
                                <td style={{ padding: '20px', textAlign: 'right', fontWeight: '900', fontSize: '1.2rem', color: t.type === 'INCOME' ? '#166534' : '#991b1b' }}>
                                    {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>NO TRANSACTIONS FOUND</div>}

                {filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filtered.length}
                    />
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="RECORD TRANSACTION">
                <form onSubmit={handleAdd}>
                    <Select label="TYPE" value={newTrans.type} onChange={e => setNewTrans({ ...newTrans, type: e.target.value })}
                        options={[{ value: 'EXPENSE', label: 'EXPENSE (PENGELUARAN)' }, { value: 'INCOME', label: 'INCOME (PEMASUKAN)' }]} />
                    <Input label="DESCRIPTION" value={newTrans.description} onChange={e => setNewTrans({ ...newTrans, description: e.target.value })} required />
                    <Input label="AMOUNT (IDR)" type="number" value={newTrans.amount} onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })} required />

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant={newTrans.type === 'EXPENSE' ? 'danger' : 'success'} style={{ flex: 1 }}>CONFIRM</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
