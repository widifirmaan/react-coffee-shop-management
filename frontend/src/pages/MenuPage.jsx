import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Alert';
import PageHeader from '../components/ui/PageHeader';
import SearchBar from '../components/ui/SearchBar';

export default function MenuPage({ user }) {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [viewingMenu, setViewingMenu] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [menuForm, setMenuForm] = useState({ name: '', category: '', price: '', description: '', imageUrl: '', available: true, gallery: ['', '', '', ''] });
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

    const isManager = user && (user.role === 'MANAGER' || user.role === 'manager');

    useEffect(() => {
        fetchMenus();
        fetchCategories();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await axios.get('/api/menus');
            setMenus(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories');
            setCategories(res.data);
        } catch (e) {
            console.error(e);
            // Fallback if API fails
            setCategories([{ id: 1, name: 'Coffee' }, { id: 2, name: 'Non-Coffee' }, { id: 3, name: 'Snack' }, { id: 4, name: 'Main Course' }]);
        }
    };

    const handleFileUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data;

            if (index === -1) {
                // Main Image
                setMenuForm(prev => ({ ...prev, imageUrl: url }));
            } else {
                // Gallery Image
                const newGallery = [...(menuForm.gallery || ['', '', '', ''])];
                newGallery[index] = url;
                setMenuForm(prev => ({ ...prev, gallery: newGallery }));
            }
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'UPLOAD FAILED' });
        }
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMenu) {
                await axios.put(`/api/menus/${editingMenu.id}`, menuForm);
                setAlertMsg({ type: 'success', message: 'MENU UPDATED!' });
            } else {
                await axios.post('/api/menus', menuForm);
                setAlertMsg({ type: 'success', message: 'MENU CREATED!' });
            }
            setIsMenuModalOpen(false);
            fetchMenus();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'OPERATION FAILED' });
        }
    };

    const handleDeleteMenu = async (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'DELETE MENU ITEM',
            message: 'ARE YOU SURE? THIS CANNOT BE UNDONE.',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/menus/${id}`);
                    setAlertMsg({ type: 'success', message: 'ITEM DELETED' });
                    setViewingMenu(null);
                    fetchMenus();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'DELETE FAILED' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    const handleDetailSave = async () => {
        try {
            await axios.put(`/api/menus/${viewingMenu.id}`, menuForm);
            setAlertMsg({ type: 'success', message: 'UPDATES SAVED!' });
            setViewingMenu(null);
            fetchMenus();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'UPDATE FAILED' });
        }
    };

    const toggleAvailability = async (menu) => {
        try {
            await axios.put(`/api/menus/${menu.id}`, { ...menu, available: !menu.available });
            fetchMenus();
        } catch (e) {
            console.error(e);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/categories', { name: newCategoryName });
            setAlertMsg({ type: 'success', message: 'CATEGORY ADDED' });
            setIsCategoryModalOpen(false);
            setNewCategoryName('');
            fetchCategories();
        } catch (e) {
            setAlertMsg({ type: 'error', message: 'FAILED TO ADD CATEGORY' });
        }
    };

    const handleDeleteCategory = async (name) => {
        setConfirmDialog({
            isOpen: true,
            title: 'DELETE CATEGORY',
            message: `DELETE CATEGORY "${name}"?`,
            onConfirm: async () => {
                try {
                    // Assuming API supports delete by name or we need to find ID. 
                    // Implementation might vary, assuming name for now as per usage.
                    const cat = categories.find(c => c.name === name);
                    if (cat) await axios.delete(`/api/categories/${cat.id}`);
                    fetchCategories();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE CATEGORY' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    // Filter Logic
    const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Group by Category
    const menusByCategory = filteredMenus.reduce((acc, menu) => {
        const cat = menu.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(menu);
        return acc;
    }, {});

    // Ensure all categories exist in map
    categories.forEach(c => {
        if (!menusByCategory[c.name]) menusByCategory[c.name] = [];
    });
    if (!menusByCategory['Featured']) menusByCategory['Featured'] = filteredMenus.filter(m => m.category === 'Featured');

    const categoriesToDisplay = ['Featured', ...categories.map(c => c.name), 'Uncategorized'].filter((v, i, a) => a.indexOf(v) === i);

    // Gallery Grid Component
    const GalleryGrid = ({ isEditable }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '200px 100px', gap: '10px' }}>
            {/* Main Image */}
            <div style={{ gridColumn: '1 / -1', position: 'relative', border: '2px solid black', background: '#eee' }}>
                {menuForm.imageUrl ? (
                    <img src={menuForm.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, fontWeight: 'bold' }}>NO IMAGE</div>
                )}
                {isEditable && (
                    <label style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'white', border: '2px solid black', padding: '5px', cursor: 'pointer' }}>
                        <Upload size={16} />
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, -1)} />
                    </label>
                )}
            </div>

            {/* Gallery Slots */}
            {(menuForm.gallery || ['', '', '', '']).slice(0, 2).map((url, i) => (
                <div key={i} style={{ position: 'relative', border: '2px solid black', background: '#eee' }}>
                    {url ? (
                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>+</div>
                    )}
                    {isEditable && (
                        <label style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
                            <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, i)} />
                        </label>
                    )}
                </div>
            ))}
        </div>
    );

    // Auto-update viewing form when viewingMenu changes
    useEffect(() => {
        if (viewingMenu) {
            setMenuForm({ ...viewingMenu, gallery: viewingMenu.gallery || ['', '', '', ''] });
        }
    }, [viewingMenu]);

    return (
        <div className="page-container" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <PageHeader
                title="MENU MANAGEMENT"
                description="MANAGE PRODUCTS & CATEGORIES"
                icon={ShoppingCart}
                color="#fde68a"
                action={isManager && <Button onClick={() => setIsCategoryModalOpen(true)} variant="primary">+ CATEGORY</Button>}
            />

            {/* Search */}
            <div style={{ marginBottom: '40px' }}>
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="SEARCH MENU ITEMS..."
                />
            </div>

            {categoriesToDisplay.map((category) => {
                const items = menusByCategory[category] || [];
                if (items.length === 0 && category === 'Uncategorized') return null;

                return (
                    <div key={category} style={{ marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <h2 className="category-header" style={{ fontWeight: '900', textTransform: 'uppercase', margin: 0, background: 'black', color: 'white', padding: '5px 15px', transform: 'rotate(-1deg)' }}>{category}</h2>
                            {isManager && category !== 'Uncategorized' && category !== 'Featured' && (
                                <Button variant="danger" style={{ padding: '5px 10px', height: 'fit-content' }} onClick={() => handleDeleteCategory(category)}>
                                    <Trash2 size={16} />
                                </Button>
                            )}
                            {isManager && (
                                <Button variant="secondary" style={{ padding: '5px 10px', height: 'fit-content', marginLeft: 'auto' }} onClick={() => {
                                    setEditingMenu(null);
                                    setMenuForm({ name: '', category: category, price: '', description: '', imageUrl: '', available: true, gallery: ['', '', '', ''] });
                                    setIsMenuModalOpen(true);
                                }}>
                                    <Plus size={16} /> ADD ITEM
                                </Button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {items.map(menu => (
                                <Card key={menu.id} style={{ opacity: menu.available ? 1 : 0.6, cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={() => setViewingMenu(menu)}>
                                    <div style={{ height: '200px', background: '#ccc', borderBottom: '4px solid black' }}>
                                        {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image" }} />}
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                            <h3 className="menu-item-title" style={{ margin: 0, fontWeight: 900, lineHeight: 1.1 }}>{menu.name}</h3>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{menu.price.toLocaleString()}</span>
                                        </div>
                                        <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '15px', height: '40px', overflow: 'hidden' }}>{menu.description}</p>

                                        {isManager && (
                                            <div style={{ paddingTop: '15px', borderTop: '2px dashed black', display: 'flex', gap: '8px' }}>
                                                <Button style={{ flex: 1, padding: '5px' }} variant={menu.available ? 'secondary' : 'success'} onClick={(e) => { e.stopPropagation(); toggleAvailability(menu); }}>
                                                    {menu.available ? 'DISABLE' : 'ENABLE'}
                                                </Button>

                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}

            <Modal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} title={editingMenu ? 'EDIT MENU ITEM' : 'ADD NEW ITEM'} maxWidth="900px">
                <form onSubmit={handleMenuSubmit} className="menu-modal-grid">
                    <div>
                        <GalleryGrid isEditable={true} />
                    </div>
                    <div>
                        <Input label="NAME" value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} required />
                        <Select
                            label="CATEGORY"
                            value={menuForm.category}
                            onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                            options={[
                                { value: 'Featured', label: 'Featured' },
                                ...categories.filter(c => c.name !== 'Featured' && c.name !== 'Uncategorized').map(c => ({ value: c.name, label: c.name })),
                                { value: 'Uncategorized', label: 'Uncategorized' }
                            ]}
                        />
                        <Input label="DESCRIPTION" value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} type="textarea" />
                        <Input label="PRICE (IDR)" type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} required />

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <Button type="button" onClick={() => setIsMenuModalOpen(false)} variant="secondary" style={{ flex: 1 }}>CANCEL</Button>
                            <Button type="submit" variant="primary" style={{ flex: 1 }}>{editingMenu ? 'SAVE CHANGES' : 'CREATE ITEM'}</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!viewingMenu && !isMenuModalOpen} onClose={() => setViewingMenu(null)} title={viewingMenu?.name || 'DETAIL'} maxWidth="900px">
                {viewingMenu && (
                    <div className="menu-modal-grid">
                        <div>
                            <GalleryGrid isEditable={isManager} />
                        </div>
                        <div>
                            {isManager ? (
                                <>
                                    <Input label="NAME" value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} />
                                    <Select
                                        label="CATEGORY"
                                        value={menuForm.category}
                                        onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                                        options={[
                                            { value: 'Featured', label: 'Featured' },
                                            ...categories.filter(c => c.name !== 'Featured' && c.name !== 'Uncategorized').map(c => ({ value: c.name, label: c.name })),
                                            { value: 'Uncategorized', label: 'Uncategorized' }
                                        ]}
                                    />
                                    <Input label="DESCRIPTION" value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} type="textarea" />
                                    <Input label="PRICE" type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} />
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                        <Button onClick={handleDetailSave} variant="primary" style={{ flex: 1 }}>SAVE CHANGES</Button>
                                        <Button onClick={() => handleDeleteMenu(viewingMenu.id)} variant="danger" style={{ flex: 1 }}>DELETE</Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>{viewingMenu.description}</p>
                                    <h2 style={{ fontSize: '2.5rem', margin: '20px 0' }}>Rp {viewingMenu.price.toLocaleString()}</h2>
                                    <Button variant="primary" style={{ width: '100%' }} disabled>ORDER AT CASHIER</Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="ADD CATEGORY">
                <form onSubmit={handleCategorySubmit}>
                    <Input label="CATEGORY NAME" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <Button type="button" onClick={() => setIsCategoryModalOpen(false)} variant="secondary" style={{ flex: 1 }}>CANCEL</Button>
                        <Button type="submit" variant="primary" style={{ flex: 1 }}>ADD</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
            {alertMsg && <Alert type={alertMsg.type} message={alertMsg.message} onClose={() => setAlertMsg(null)} />}
        </div>
    );
}
