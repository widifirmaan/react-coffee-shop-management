import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Plus, Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';

const CATEGORIES = [
    'Sales', 'Raw Materials / Inventory', 'Salaries / Wages',
    'Utilities (Electricity/Water/Net)', 'Maintenance & Repairs',
    'Marketing & Promo', 'Rent & Facility', 'Other'
];

export default function FinancePage({ user }) {
    const isManager = (user?.role || '').toUpperCase() === 'MANAGER';
    const [transactions, setTransactions] = useState([]);
    const [newTrans, setNewTrans] = useState({
        type: 'EXPENSE',
        category: 'Raw Materials / Inventory',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL', 'TODAY', 'WEEK', 'MONTH'
    const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'INCOME', 'EXPENSE'
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
            console.error('Failed to load transactions', e);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/transactions', {
                ...newTrans,
                amount: parseFloat(newTrans.amount || 0)
            });
            setNewTrans({
                type: 'EXPENSE',
                category: 'Raw Materials / Inventory',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            setIsModalOpen(false);
            fetchTransactions();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO SAVE TRANSACTION' });
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    // Time filtering logic
    const filterByDate = (txDateStr) => {
        if (timeFilter === 'ALL') return true;
        const txDate = new Date(txDateStr);
        const now = new Date();

        if (timeFilter === 'TODAY') {
            return txDate.toDateString() === now.toDateString();
        }
        if (timeFilter === 'WEEK') {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return txDate >= weekAgo;
        }
        if (timeFilter === 'MONTH') {
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        }
        return true;
    };

    const filtered = transactions.filter(t => {
        const searchLower = (searchTerm || '').toLowerCase();
        const matchesSearch = !searchTerm ||
            (t.description || '').toLowerCase().includes(searchLower) ||
            (t.category && t.category.toLowerCase().includes(searchLower));
        const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
        const matchesTime = filterByDate(t.date || t.createdAt);
        return matchesSearch && matchesType && matchesTime;
    });

    const income = filtered.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const expense = filtered.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const handleDelete = (t) => {
        setConfirmDialog({
            title: 'DELETE TRANSACTION?',
            message: `Hapus transaksi ${t.type} "${t.description || t.category}" sebesar ${formatRupiah(t.amount)}?`,
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/transactions/${t.id}`);
                    setAlertMsg({ type: 'success', message: 'TRANSACTION DELETED!' });
                    fetchTransactions();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE TRANSACTION' });
                }
                setConfirmDialog(null);
            }
        });
    };

    // Export CSV
    const exportCSV = () => {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (IDR)', 'Recorded By'];
        const rows = filtered.map(t => [
            new Date(t.date || t.createdAt).toLocaleDateString('id-ID'),
            t.type,
            `"${t.category || 'General'}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.amount,
            t.employeeId || 'System'
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `siap_nyafe_finance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-container" style={{ paddingTop: '40px' }}>
            <PageHeader
                title="FINANCE & CASHFLOW"
                description="REAL-TIME REVENUE, EXPENSES & NET PROFIT TRACKER"
                icon={DollarSign}
                color="#d1fae5"
                action={
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            onClick={exportCSV}
                            variant="secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', fontWeight: '900' }}
                        >
                            <Download size={18} /> EXPORT CSV
                        </Button>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant="primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: '#10b981', color: 'black', fontWeight: '900' }}
                        >
                            <Plus size={18} /> RECORD TRANSACTION
                        </Button>
                    </div>
                }
            />

            {/* KPI STAT CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Card style={{ background: '#dcfce7', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>
                                TOTAL INCOME ({timeFilter})
                            </div>
                            <div style={{ color: '#15803d', fontSize: '2.2rem', fontWeight: '900', fontFamily: 'monospace', marginTop: '6px' }}>
                                + {formatRupiah(income)}
                            </div>
                        </div>
                        <ArrowUpRight size={40} color="#15803d" strokeWidth={2.5} />
                    </div>
                </Card>

                <Card style={{ background: '#fee2e2', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>
                                TOTAL EXPENSES ({timeFilter})
                            </div>
                            <div style={{ color: '#b91c1c', fontSize: '2.2rem', fontWeight: '900', fontFamily: 'monospace', marginTop: '6px' }}>
                                - {formatRupiah(expense)}
                            </div>
                        </div>
                        <ArrowDownRight size={40} color="#b91c1c" strokeWidth={2.5} />
                    </div>
                </Card>

                <Card style={{ background: profit >= 0 ? '#bbf7d0' : '#fecaca', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>
                                NET PROFIT / MARGIN
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '900', fontFamily: 'monospace', marginTop: '6px', color: profit >= 0 ? '#166534' : '#991b1b' }}>
                                {formatRupiah(profit)}
                            </div>
                        </div>
                        <TrendingUp size={40} color={profit >= 0 ? '#166534' : '#991b1b'} strokeWidth={2.5} />
                    </div>
                </Card>
            </div>

            {/* FILTERS & SEARCH BAR */}
            <div style={{
                background: 'white',
                border: '3px solid black',
                boxShadow: '4px 4px 0 0 black',
                padding: '15px 20px',
                marginBottom: '25px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                        placeholder="SEARCH BY DESCRIPTION OR CATEGORY..."
                    />
                </div>

                {/* Period Filter Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', marginRight: '4px' }}>PERIOD:</span>
                    {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(period => (
                        <button
                            key={period}
                            onClick={() => { setTimeFilter(period); setCurrentPage(1); }}
                            style={{
                                padding: '6px 12px',
                                border: '2px solid black',
                                background: timeFilter === period ? 'black' : '#f3f4f6',
                                color: timeFilter === period ? 'white' : 'black',
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            {period}
                        </button>
                    ))}
                </div>

                {/* Type Filter Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', marginRight: '4px' }}>TYPE:</span>
                    {['ALL', 'INCOME', 'EXPENSE'].map(type => (
                        <button
                            key={type}
                            onClick={() => { setTypeFilter(type); setCurrentPage(1); }}
                            style={{
                                padding: '6px 12px',
                                border: '2px solid black',
                                background: typeFilter === type ? 'black' : '#f3f4f6',
                                color: typeFilter === type ? 'white' : 'black',
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>DATE</Th>
                            <Th>CATEGORY</Th>
                            <Th>DESCRIPTION</Th>
                            <Th>TYPE</Th>
                            <Th style={{ textAlign: 'right' }}>AMOUNT</Th>
                            {isManager && <Th style={{ textAlign: 'center' }}>ACTION</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedData.map((t, i) => (
                            <Tr key={t.id || i} index={i}>
                                <Td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    {new Date(t.date || t.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Td>
                                <Td>
                                    <span style={{
                                        background: '#f3f4f6',
                                        border: '1.5px solid black',
                                        padding: '2px 8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {t.category || (t.type === 'INCOME' ? 'Sales' : 'General')}
                                    </span>
                                </Td>
                                <Td style={{ fontWeight: 'bold' }}>{t.description}</Td>
                                <Td>
                                    <Badge variant={t.type === 'INCOME' ? 'success' : 'danger'}>
                                        {t.type}
                                    </Badge>
                                </Td>
                                <Td align="right" style={{
                                    fontWeight: '900',
                                    fontSize: '1.1rem',
                                    fontFamily: 'monospace',
                                    color: t.type === 'INCOME' ? '#15803d' : '#b91c1c'
                                }}>
                                    {t.type === 'INCOME' ? '+ ' : '- '}
                                    {formatRupiah(t.amount)}
                                </Td>
                                {isManager && (
                                    <Td align="center">
                                        <Button
                                            onClick={() => handleDelete(t)}
                                            variant="danger"
                                            style={{ padding: '6px 10px' }}
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </Td>
                                )}
                            </Tr>
                        ))}
                        {filtered.length === 0 && (
                            <Tr>
                                <Td colSpan={isManager ? 6 : 5} style={{ padding: '40px', textAlign: 'center', opacity: 0.5, fontWeight: 'bold' }}>
                                    NO TRANSACTIONS FOUND MATCHING FILTER CRITERIA
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filtered.length}
                />
            )}

            {/* ADD TRANSACTION MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="RECORD FINANCIAL TRANSACTION">
                <form onSubmit={handleAdd}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '6px' }}>TRANSACTION TYPE *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setNewTrans({ ...newTrans, type: 'EXPENSE' })}
                                style={{
                                    padding: '12px',
                                    border: '3px solid black',
                                    background: newTrans.type === 'EXPENSE' ? '#ef4444' : '#f3f4f6',
                                    color: newTrans.type === 'EXPENSE' ? 'white' : 'black',
                                    fontWeight: '900',
                                    cursor: 'pointer'
                                }}
                            >
                                🔴 EXPENSE (PENGELUARAN)
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTrans({ ...newTrans, type: 'INCOME' })}
                                style={{
                                    padding: '12px',
                                    border: '3px solid black',
                                    background: newTrans.type === 'INCOME' ? '#22c55e' : '#f3f4f6',
                                    color: newTrans.type === 'INCOME' ? 'white' : 'black',
                                    fontWeight: '900',
                                    cursor: 'pointer'
                                }}
                            >
                                🟢 INCOME (PEMASUKAN)
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '6px' }}>CATEGORY</label>
                        <select
                            value={newTrans.category}
                            onChange={(e) => setNewTrans({ ...newTrans, category: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold' }}
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                        <Input
                            label="AMOUNT (IDR) *"
                            type="number"
                            min="1"
                            placeholder="e.g. 500000"
                            value={newTrans.amount}
                            onChange={(e) => setNewTrans({ ...newTrans, amount: e.target.value })}
                            required
                        />

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '8px' }}>DATE</label>
                            <input
                                type="date"
                                value={newTrans.date}
                                onChange={(e) => setNewTrans({ ...newTrans, date: e.target.value })}
                                style={{ width: '100%', padding: '15px', border: '3px solid black', fontWeight: 'bold', fontFamily: 'monospace' }}
                            />
                        </div>
                    </div>

                    <Input
                        label="DESCRIPTION / NOTES *"
                        placeholder="e.g. Pembelian susu 10 botol, tagihan listrik PLN, dll"
                        value={newTrans.description}
                        onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
                        required
                        maxLength={120}
                    />

                    <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            style={{
                                flex: 1,
                                background: newTrans.type === 'EXPENSE' ? '#ef4444' : '#22c55e',
                                color: 'white',
                                fontWeight: '900'
                            }}
                        >
                            RECORD {newTrans.type}
                        </Button>
                    </div>
                </form>
            </Modal>

            {confirmDialog && (
                <ConfirmDialog
                    isOpen={!!confirmDialog}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText="DELETE"
                    cancelText="CANCEL"
                    variant="danger"
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}
        </div>
    );
}
