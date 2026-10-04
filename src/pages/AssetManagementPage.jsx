import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Wrench, Plus, Trash2, Search, AlertTriangle, CheckCircle,
    Edit, DollarSign, Package, ShieldCheck, MapPin, Tag, RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import PageHeader from '../components/ui/PageHeader';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

const CATEGORIES = ['All', 'Equipment', 'Electronics', 'Furniture', 'Utensils', 'Facility'];
const CONDITIONS = ['All', 'GOOD', 'NEEDS_MAINTENANCE', 'BROKEN'];
const STATUSES = ['All', 'ACTIVE', 'IN_REPAIR', 'RETIRED'];

export default function AssetManagementPage({ user }) {
    const isManager = user?.role?.toUpperCase() === 'MANAGER';
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [alertMsg, setAlertMsg] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        assetCode: '',
        category: 'Equipment',
        location: 'Bar Area',
        purchaseDate: '',
        purchasePrice: 0,
        condition: 'GOOD',
        status: 'ACTIVE',
        serialNumber: '',
        notes: ''
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/assets');
            setAssets(res.data);
        } catch (e) {
            console.error('Failed to fetch assets', e);
            setAlertMsg({ type: 'error', message: 'Failed to load assets from server' });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAsset) {
                await axios.put(`/api/assets/${editingAsset.id}`, formData);
                setAlertMsg({ type: 'success', message: 'ASSET UPDATED SUCCESSFULLY!' });
            } else {
                await axios.post('/api/assets', formData);
                setAlertMsg({ type: 'success', message: 'NEW ASSET REGISTERED!' });
            }
            setIsFormModalOpen(false);
            resetForm();
            fetchAssets();
        } catch (err) {
            const msg = err.response?.data?.message || 'FAILED TO SAVE ASSET!';
            setAlertMsg({ type: 'error', message: msg });
        }
    };

    const handleQuickConditionUpdate = async (e) => {
        e.preventDefault();
        if (!editingAsset) return;
        try {
            await axios.put(`/api/assets/${editingAsset.id}`, {
                condition: formData.condition,
                status: formData.status,
                notes: formData.notes
            });
            setAlertMsg({ type: 'success', message: 'ASSET CONDITION UPDATED!' });
            setIsConditionModalOpen(false);
            resetForm();
            fetchAssets();
        } catch (err) {
            const msg = err.response?.data?.message || 'FAILED TO UPDATE CONDITION!';
            setAlertMsg({ type: 'error', message: msg });
        }
    };

    const handleDelete = (asset) => {
        setConfirmDialog({
            isOpen: true,
            title: `DELETE ASSET: ${asset.name}?`,
            message: `Asset Code: ${asset.assetCode || 'N/A'}. This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/assets/${asset.id}`);
                    setAlertMsg({ type: 'success', message: 'ASSET DELETED SUCCESSFULLY!' });
                    fetchAssets();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE ASSET!' });
                }
                setConfirmDialog(null);
            }
        });
    };

    const openEditModal = (asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name || '',
            assetCode: asset.assetCode || '',
            category: asset.category || 'Equipment',
            location: asset.location || 'Bar Area',
            purchaseDate: asset.purchaseDate || '',
            purchasePrice: asset.purchasePrice || 0,
            condition: asset.condition || 'GOOD',
            status: asset.status || 'ACTIVE',
            serialNumber: asset.serialNumber || '',
            notes: asset.notes || ''
        });
        setIsFormModalOpen(true);
    };

    const openConditionModal = (asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name || '',
            assetCode: asset.assetCode || '',
            category: asset.category || 'Equipment',
            location: asset.location || '',
            purchaseDate: asset.purchaseDate || '',
            purchasePrice: asset.purchasePrice || 0,
            condition: asset.condition || 'GOOD',
            status: asset.status || 'ACTIVE',
            serialNumber: asset.serialNumber || '',
            notes: asset.notes || ''
        });
        setIsConditionModalOpen(true);
    };

    const resetForm = () => {
        setEditingAsset(null);
        setFormData({
            name: '',
            assetCode: '',
            category: 'Equipment',
            location: 'Bar Area',
            purchaseDate: '',
            purchasePrice: 0,
            condition: 'GOOD',
            status: 'ACTIVE',
            serialNumber: '',
            notes: ''
        });
    };

    // Filter logic
    const filteredAssets = assets.filter(a => {
        const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
        const matchesCondition = selectedCondition === 'All' || a.condition === selectedCondition;
        const searchLower = (searchTerm || '').toLowerCase();
        const matchesSearch = !searchTerm ||
            (a.name && a.name.toLowerCase().includes(searchLower)) ||
            (a.assetCode && a.assetCode.toLowerCase().includes(searchLower)) ||
            (a.location && a.location.toLowerCase().includes(searchLower)) ||
            (a.serialNumber && a.serialNumber.toLowerCase().includes(searchLower));
        return matchesCategory && matchesCondition && matchesSearch;
    });

    const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.purchasePrice) || 0), 0);
    const goodConditionCount = assets.filter(a => a.condition === 'GOOD').length;
    const maintenanceCount = assets.filter(a => a.condition === 'NEEDS_MAINTENANCE' || a.condition === 'BROKEN').length;

    // Pagination
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const paginatedAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const getConditionBadge = (cond) => {
        switch (cond) {
            case 'GOOD':
                return <Badge variant="success">GOOD</Badge>;
            case 'NEEDS_MAINTENANCE':
                return <Badge variant="warning">MAINTENANCE</Badge>;
            case 'BROKEN':
                return <Badge variant="danger">BROKEN</Badge>;
            default:
                return <Badge variant="default">{cond || 'UNKNOWN'}</Badge>;
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'ACTIVE':
                return <Badge variant="success">ACTIVE</Badge>;
            case 'IN_REPAIR':
                return <Badge variant="info">IN REPAIR</Badge>;
            case 'RETIRED':
                return <Badge variant="default">RETIRED</Badge>;
            default:
                return <Badge variant="default">{st || 'ACTIVE'}</Badge>;
        }
    };

    return (
        <div className="page-container" style={{ paddingTop: '40px' }}>
            <Alert
                type={alertMsg?.type}
                message={alertMsg?.message}
                onClose={() => setAlertMsg(null)}
            />

            <ConfirmDialog
                isOpen={!!confirmDialog}
                title={confirmDialog?.title || ''}
                message={confirmDialog?.message || ''}
                confirmText="DELETE"
                cancelText="CANCEL"
                variant="danger"
                onConfirm={confirmDialog?.onConfirm}
                onCancel={() => setConfirmDialog(null)}
            />

            <PageHeader
                title="ASSET MANAGEMENT"
                description="EQUIPMENT, MACHINERY, ELECTRONICS & FURNITURE REGISTRY"
                icon={Wrench}
                color="#fcd34d"
                action={isManager ? (
                    <Button
                        onClick={() => { resetForm(); setIsFormModalOpen(true); }}
                        variant="primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f59e0b', color: 'black' }}
                    >
                        <Plus size={20} /> ADD NEW ASSET
                    </Button>
                ) : null}
            />

            {/* KPI STAT CARDS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <Card style={{ background: '#38bdf8', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>TOTAL ASSETS</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace' }}>{assets.length}</div>
                        </div>
                        <Package size={40} strokeWidth={2.5} />
                    </div>
                </Card>

                <Card style={{ background: '#34d399', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>TOTAL VALUATION</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: 'monospace', marginTop: '8px' }}>
                                {formatRupiah(totalValue)}
                            </div>
                        </div>
                        <DollarSign size={40} strokeWidth={2.5} />
                    </div>
                </Card>

                <Card style={{ background: '#a7f3d0', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>GOOD CONDITION</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace' }}>{goodConditionCount}</div>
                        </div>
                        <CheckCircle size={40} strokeWidth={2.5} />
                    </div>
                </Card>

                <Card style={{ background: maintenanceCount > 0 ? '#fca5a5' : '#e5e7eb', color: 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>MAINTENANCE / BROKEN</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace' }}>{maintenanceCount}</div>
                        </div>
                        <AlertTriangle size={40} strokeWidth={2.5} />
                    </div>
                </Card>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div style={{
                background: 'white',
                border: '4px solid black',
                boxShadow: '6px 6px 0 0 black',
                padding: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Search */}
                    <div style={{ flex: '1 1 300px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input
                            type="text"
                            placeholder="SEARCH BY ASSET NAME, CODE, SERIAL NUMBER, LOCATION..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 45px',
                                border: '3px solid black',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900' }}>CATEGORY:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                            style={{
                                padding: '10px 15px',
                                border: '3px solid black',
                                fontWeight: 'bold',
                                outline: 'none',
                                background: '#f3f4f6'
                            }}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                        </select>
                    </div>

                    {/* Condition Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900' }}>CONDITION:</span>
                        <select
                            value={selectedCondition}
                            onChange={(e) => { setSelectedCondition(e.target.value); setCurrentPage(1); }}
                            style={{
                                padding: '10px 15px',
                                border: '3px solid black',
                                fontWeight: 'bold',
                                outline: 'none',
                                background: '#f3f4f6'
                            }}
                        >
                            {CONDITIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <Button
                        onClick={fetchAssets}
                        variant="secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px' }}
                    >
                        <RefreshCw size={16} /> REFRESH
                    </Button>
                </div>
            </div>

            {/* ASSETS TABLE */}
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>CODE</Th>
                            <Th>NAME & SPECS</Th>
                            <Th>CATEGORY</Th>
                            <Th>LOCATION</Th>
                            <Th>CONDITION</Th>
                            <Th>STATUS</Th>
                            <Th>PRICE</Th>
                            <Th style={{ textAlign: 'center' }}>ACTIONS</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>
                                    LOADING ASSET REGISTRY...
                                </Td>
                            </Tr>
                        ) : paginatedAssets.length === 0 ? (
                            <Tr>
                                <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>
                                    NO ASSETS FOUND MATCHING YOUR CRITERIA.
                                </Td>
                            </Tr>
                        ) : (
                            paginatedAssets.map((asset, idx) => (
                                <Tr key={asset.id || idx} index={idx}>
                                    <Td style={{ fontFamily: 'monospace', fontWeight: '900', color: '#1e3a8a' }}>
                                        {asset.assetCode || 'N/A'}
                                    </Td>
                                    <Td>
                                        <div style={{ fontWeight: '900', fontSize: '1rem' }}>{asset.name}</div>
                                        {asset.serialNumber && (
                                            <div style={{ fontSize: '0.75rem', opacity: 0.7, fontFamily: 'monospace' }}>
                                                SN: {asset.serialNumber}
                                            </div>
                                        )}
                                        {asset.notes && (
                                            <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#6b7280', marginTop: '2px' }}>
                                                "{asset.notes}"
                                            </div>
                                        )}
                                    </Td>
                                    <Td>
                                        <span style={{
                                            background: '#e0e7ff',
                                            border: '1.5px solid black',
                                            padding: '2px 8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {asset.category}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                            <MapPin size={14} /> {asset.location || 'Main Area'}
                                        </div>
                                    </Td>
                                    <Td>{getConditionBadge(asset.condition)}</Td>
                                    <Td>{getStatusBadge(asset.status)}</Td>
                                    <Td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        {formatRupiah(asset.purchasePrice)}
                                    </Td>
                                    <Td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                                            {/* Quick condition report for all staff */}
                                            <button
                                                onClick={() => openConditionModal(asset)}
                                                title="Report Condition / Update Status"
                                                style={{
                                                    background: '#fef08a',
                                                    border: '2px solid black',
                                                    padding: '6px 10px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                STATUS
                                            </button>

                                            {/* Full Edit & Delete for Manager */}
                                            {isManager && (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(asset)}
                                                        title="Edit Asset Details"
                                                        style={{
                                                            background: '#67e8f9',
                                                            border: '2px solid black',
                                                            padding: '6px 10px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(asset)}
                                                        title="Delete Asset"
                                                        style={{
                                                            background: '#f87171',
                                                            border: '2px solid black',
                                                            padding: '6px 10px',
                                                            cursor: 'pointer',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* ADD / EDIT FULL ASSET MODAL (Manager) */}
            <Modal
                isOpen={isFormModalOpen}
                title={editingAsset ? 'EDIT ASSET DETAILS' : 'REGISTER NEW ASSET'}
                onClose={() => { setIsFormModalOpen(false); resetForm(); }}
            >
                <form onSubmit={handleFormSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>ASSET NAME *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. La Marzocco Linea PB 2-Group"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>CATEGORY</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            >
                                <option value="Equipment">Equipment (Mesin/Alat)</option>
                                <option value="Electronics">Electronics (POS, AC, Sound)</option>
                                <option value="Furniture">Furniture (Meja, Kursi)</option>
                                <option value="Utensils">Utensils (Portafilter, Pitcher)</option>
                                <option value="Facility">Facility (Bangunan, Instalasi)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>ASSET CODE (AUTO/MANUAL)</label>
                            <input
                                type="text"
                                placeholder="Leave blank for auto-generate"
                                value={formData.assetCode}
                                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>LOCATION / STATION</label>
                            <input
                                type="text"
                                placeholder="e.g. Bar Area, Kitchen, Dining Hall"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>SERIAL NUMBER</label>
                            <input
                                type="text"
                                placeholder="e.g. LM-PB2-98421"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>PURCHASE PRICE (IDR)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={formData.purchasePrice}
                                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>PURCHASE DATE</label>
                            <input
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>CONDITION</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            >
                                <option value="GOOD">GOOD (Baik & Normal)</option>
                                <option value="NEEDS_MAINTENANCE">NEEDS MAINTENANCE (Perlu Servis)</option>
                                <option value="BROKEN">BROKEN (Rusak)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>STATUS</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            >
                                <option value="ACTIVE">ACTIVE (Sedang Digunakan)</option>
                                <option value="IN_REPAIR">IN REPAIR (Sedang Diperbaiki)</option>
                                <option value="RETIRED">RETIRED (Tidak Digunakan / Dijual)</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>MAINTENANCE NOTES / SPECS</label>
                            <textarea
                                rows={3}
                                placeholder="Catatan servis rutin, jadwal ganti sparepart, spesifikasi daya..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <Button type="button" variant="secondary" onClick={() => { setIsFormModalOpen(false); resetForm(); }}>
                            CANCEL
                        </Button>
                        <Button type="submit" variant="primary" style={{ background: '#f59e0b', color: 'black' }}>
                            {editingAsset ? 'UPDATE ASSET' : 'SAVE ASSET'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* QUICK CONDITION UPDATE MODAL (Staff & Manager) */}
            <Modal
                isOpen={isConditionModalOpen}
                title={`UPDATE STATUS: ${editingAsset?.name || 'ASSET'}`}
                onClose={() => { setIsConditionModalOpen(false); resetForm(); }}
            >
                <form onSubmit={handleQuickConditionUpdate}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', padding: '10px', background: '#f3f4f6', border: '2px solid black' }}>
                            Asset Code: <strong>{editingAsset?.assetCode}</strong> | Location: <strong>{editingAsset?.location}</strong>
                        </div>

                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>CONDITION *</label>
                        <select
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold', marginBottom: '15px' }}
                        >
                            <option value="GOOD">🟢 GOOD (Kondisi Prima / Siap Pakai)</option>
                            <option value="NEEDS_MAINTENANCE">🟡 NEEDS MAINTENANCE (Perlu Perawatan / Servis)</option>
                            <option value="BROKEN">🔴 BROKEN (Rusak / Kendala Operasional)</option>
                        </select>

                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>OPERATIONAL STATUS *</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '3px solid black', fontWeight: 'bold', marginBottom: '15px' }}
                        >
                            <option value="ACTIVE">ACTIVE (Sedang Beroperasi)</option>
                            <option value="IN_REPAIR">IN REPAIR (Sedang Dalam Perbaikan Teknisi)</option>
                            <option value="RETIRED">RETIRED (Nonaktif / Afkir)</option>
                        </select>

                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '5px' }}>CONDITION ISSUE / MAINTENANCE NOTES</label>
                        <textarea
                            rows={4}
                            placeholder="Deskripsikan masalah, keluhan mesin, atau jadwal servis..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '3px solid black', fontWeight: 'bold' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <Button type="button" variant="secondary" onClick={() => { setIsConditionModalOpen(false); resetForm(); }}>
                            CANCEL
                        </Button>
                        <Button type="submit" variant="primary">
                            SAVE STATUS REPORT
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
