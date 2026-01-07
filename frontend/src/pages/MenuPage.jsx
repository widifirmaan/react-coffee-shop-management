import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2, Edit2, Upload, Check, X } from 'lucide-react';

export default function MenuPage({ user }) {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);

    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [menuForm, setMenuForm] = useState({
        name: '', category: 'Coffee', price: '', description: '', imageUrl: '', available: true
    });
    const [viewingMenu, setViewingMenu] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); // The original category name being edited
    const [editingCategoryName, setEditingCategoryName] = useState(''); // The input value for rename
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

    const isManager = user?.role?.toLowerCase() === 'manager';

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (viewingMenu && isManager) {
            let initialImages = viewingMenu.gallery || [];
            if (initialImages.length === 0 && viewingMenu.imageUrl) {
                initialImages = [viewingMenu.imageUrl];
            }
            const paddedImages = [...initialImages];
            while (paddedImages.length < 4) paddedImages.push('');

            setMenuForm({
                name: viewingMenu.name,
                category: viewingMenu.category,
                price: viewingMenu.price,
                description: viewingMenu.description || '',
                imageUrl: viewingMenu.imageUrl || '',
                gallery: paddedImages,
                available: viewingMenu.available
            });
        }
    }, [viewingMenu, isManager]);

    const fetchData = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                axios.get('/api/menus'),
                axios.get('/api/categories')
            ]);
            setMenus(menuRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMenuForm({ ...menuForm, imageUrl: res.data });
        } catch (error) {
            setAlertMsg({ type: 'error', message: 'UPLOAD FAILED' });
        }
    };

    const handleGalleryUpload = async (index, file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/api/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data;

            const newImages = [...(menuForm.gallery || ['', '', '', ''])];
            newImages[index] = url;

            // Sync main image
            let mainUrl = menuForm.imageUrl;
            if (index === 0) mainUrl = url;

            setMenuForm({ ...menuForm, gallery: newImages, imageUrl: mainUrl });
        } catch (error) {
            setAlertMsg({ type: 'error', message: 'UPLOAD FAILED' });
        }
    };

    const handleGalleryDelete = (index) => {
        const newImages = [...(menuForm.gallery || ['', '', '', ''])];
        newImages[index] = '';

        let mainUrl = menuForm.imageUrl;
        if (index === 0) mainUrl = '';

        setMenuForm({ ...menuForm, gallery: newImages, imageUrl: mainUrl });
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();

        setConfirmDialog({
            message: 'SAVE THIS ITEM?',
            buttonText: 'SAVE',
            buttonColor: '#8B5CF6',
            onConfirm: async () => {
                try {
                    if (editingMenu) {
                        await axios.put(`/api/menus/${editingMenu.id}`, menuForm);
                    } else {
                        await axios.post('/api/menus', menuForm);
                    }
                    setIsMenuModalOpen(false);
                    fetchData();
                    setAlertMsg({ type: 'success', message: 'ITEM SAVED!' });
                } catch (error) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO SAVE MENU' });
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleDetailSave = async () => {
        if (!viewingMenu) return;

        setConfirmDialog({
            message: 'SAVE CHANGES?',
            buttonText: 'SAVE',
            buttonColor: '#8B5CF6',
            onConfirm: async () => {
                try {
                    await axios.put(`/api/menus/${viewingMenu.id}`, menuForm);
                    setViewingMenu(null);
                    setAlertMsg({ type: 'success', message: 'CHANGES SAVED!' });
                    fetchData();
                } catch (error) {
                    setAlertMsg({ type: 'error', message: 'SAVE FAILED' });
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleDeleteMenu = async (id) => {
        setConfirmDialog({
            message: 'DELETE THIS ITEM?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/menus/${id}`);
                    fetchData();
                    setAlertMsg({ type: 'success', message: 'ITEM DELETED!' });
                } catch (error) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE' });
                }
                setConfirmDialog(null);
            }
        });
    };

    const toggleAvailability = async (menu) => {
        const action = menu.available ? 'DISABLE' : 'ENABLE';
        const buttonColor = menu.available ? '#ff4444' : '#44ff44';

        setConfirmDialog({
            message: `${action} "${menu.name}"?`,
            buttonText: action,
            buttonColor: buttonColor,
            onConfirm: async () => {
                try {
                    await axios.put(`/api/menus/${menu.id}`, { ...menu, available: !menu.available });
                    fetchData();
                    setAlertMsg({ type: 'success', message: `ITEM ${action}D!` });
                } catch (error) {
                    setAlertMsg({ type: 'error', message: 'UPDATE FAILED' });
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        const exists = categories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase().trim());
        if (exists) {
            setAlertMsg({ type: 'error', message: 'CATEGORY ALREADY EXISTS!' });
            setTimeout(() => setAlertMsg(null), 3000); // Auto clear
            return;
        }

        try {
            await axios.post('/api/categories', { name: newCategoryName });
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
            fetchData();
        } catch (error) {
            setAlertMsg({ type: 'error', message: 'FAILED TO ADD CATEGORY' });
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (!window.confirm(`Delete category "${categoryName}"? Menus will be moved to Uncategorized.`)) return;

        // 1. Find category ID
        const catObj = categories.find(c => c.name === categoryName);

        if (categoryName === 'Uncategorized') {
            setAlertMsg({ type: 'error', message: 'CANNOT DELETE DEFAULT' });
            return;
        }

        try {
            // 2. Update all menus in this category
            const menusToUpdate = menus.filter(m => m.category === categoryName);
            await Promise.all(menusToUpdate.map(menu =>
                axios.put(`/api/menus/${menu.id}`, { ...menu, category: 'Uncategorized' })
            ));

            // 3. Delete the category from DB
            if (catObj && catObj.id) {
                await axios.delete(`/api/categories/${catObj.id}`);
            }

            fetchData();
        } catch (error) {
            console.error(error);
            setAlertMsg({ type: 'error', message: 'FAILED TO DELETE CATEGORY' });
        }
    };

    const handleCategoryRename = async (e) => {
        e.preventDefault();
        if (!editingCategory || !editingCategoryName.trim()) return;

        const oldName = editingCategory;
        const newName = editingCategoryName.trim();

        if (oldName === newName) {
            setEditingCategory(null);
            return;
        }

        // Check if duplicate
        const exists = categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.name !== oldName);
        if (exists) {
            setAlertMsg({ type: 'error', message: 'CATEGORY ALREADY EXISTS!' });
            setTimeout(() => setAlertMsg(null), 3000); // Auto clear
            return;
        }

        try {
            // 1. Create New Category
            await axios.post('/api/categories', { name: newName });

            // 2. Update Menus
            const menusToUpdate = menus.filter(m => m.category === oldName);
            await Promise.all(menusToUpdate.map(menu =>
                axios.put(`/api/menus/${menu.id}`, { ...menu, category: newName })
            ));

            // 3. Delete Old Category
            const catObj = categories.find(c => c.name === oldName);
            if (catObj && catObj.id) {
                await axios.delete(`/api/categories/${catObj.id}`);
            }

            setEditingCategory(null);
            fetchData();
        } catch (error) {
            console.error(error);
            setAlertMsg({ type: 'error', message: 'FAILED TO RENAME CATEGORY' });
        }
    };

    // Grouping logic
    const menusByCategory = menus.reduce((acc, menu) => {
        const cat = menu.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(menu);
        return acc;
    }, {});

    // Combine DB categories + derived categories
    const categoriesToDisplay = [...categories.map(c => c.name)];
    if (!categoriesToDisplay.includes('Uncategorized')) categoriesToDisplay.push('Uncategorized');
    Object.keys(menusByCategory).forEach(c => {
        if (!categoriesToDisplay.includes(c)) categoriesToDisplay.push(c);
    });

    // Ensure 'Featured' exists and is first (Permanent Category)
    if (!categoriesToDisplay.includes('Featured')) {
        categoriesToDisplay.unshift('Featured');
    } else {
        const idx = categoriesToDisplay.indexOf('Featured');
        if (idx > 0) {
            categoriesToDisplay.splice(idx, 1);
            categoriesToDisplay.unshift('Featured');
        }
    }

    return (
        <div style={{ padding: '40px', paddingTop: '40px', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', background: '#fde68a', border: '4px solid black', padding: '20px', boxShadow: '8px 8px 0 0 black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ShoppingCart size={48} /> MENU MANAGEMENT
                    </h1>
                    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', opacity: 0.6 }}>MANAGE PRODUCTS & CATEGORIES</p>
                </div>
                {isManager && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="accent" onClick={() => setIsCategoryModalOpen(true)}>+ CATEGORY</button>
                    </div>
                )}
            </div>

            {categoriesToDisplay.map((category) => {
                const items = menusByCategory[category] || [];
                if (items.length === 0 && category === 'Uncategorized') return null; // Skip empty Uncategorized
                return (
                    <div key={category} className="category-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            {editingCategory === category ? (
                                <form onSubmit={handleCategoryRename} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        autoFocus
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        style={{ fontSize: '1.5rem', padding: '5px', width: '300px', fontWeight: 'bold', margin: 0, border: '4px solid black' }}
                                    />
                                    <button type="submit" className="success" style={{ padding: '8px' }}><Check size={20} /></button>
                                    <button type="button" className="danger" style={{ padding: '8px' }} onClick={() => setEditingCategory(null)}><X size={20} /></button>
                                </form>
                            ) : (
                                <>
                                    <h2 className="category-title" style={{ marginBottom: 0 }}>{category}</h2>
                                    {isManager && (
                                        <>
                                            <button className="primary" style={{ padding: '8px 15px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => {
                                                setEditingMenu(null);
                                                setMenuForm({ name: '', category: category, price: '', description: '', imageUrl: '', available: true });
                                                setIsMenuModalOpen(true);
                                            }}>
                                                <Plus size={18} /> ADD ITEM
                                            </button>

                                            {category !== 'Uncategorized' && category !== 'Featured' && (
                                                <>
                                                    <button style={{ padding: '8px', background: 'white', border: '2px solid black', cursor: 'pointer', boxShadow: '4px 4px 0 0 black' }} onClick={() => { setEditingCategory(category); setEditingCategoryName(category); }}>
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button className="danger" style={{ padding: '8px' }} onClick={() => handleDeleteCategory(category)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="grid">
                            {items.map(menu => (
                                <div key={menu.id} className="card menu-card" style={{ opacity: menu.available ? 1 : 0.6, cursor: 'pointer' }} onClick={() => setViewingMenu(menu)}>
                                    {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} className="menu-image" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />}
                                    <div style={{ padding: '15px' }}>
                                        <h3 style={{ margin: 0 }}>{menu.name}</h3>
                                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{menu.description}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                            <span className="badge">Rp {menu.price.toLocaleString()}</span>
                                        </div>

                                        {isManager && (
                                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid black', display: 'flex', gap: '8px' }}>
                                                <button style={{ flex: 1, padding: '5px' }} className={menu.available ? 'danger' : 'success'} onClick={(e) => { e.stopPropagation(); toggleAvailability(menu); }}>
                                                    {menu.available ? 'OFF' : 'ON'}
                                                </button>
                                                <button style={{ flex: 1, padding: '5px' }} className="danger" onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu.id); }}><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Menu Modal */}
            {isMenuModalOpen && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '95%', height: '95vh', overflowY: 'auto', maxWidth: 'none', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '4px solid black' }}>
                            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>ADD NEW ITEM</h2>
                            <button onClick={() => setIsMenuModalOpen(false)} style={{ background: 'black', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>X</button>
                        </div>

                        <form onSubmit={handleMenuSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', flex: 1 }}>
                            {/* Gallery Section */}
                            <div>
                                <style>{`
                                    .gallery-slot:hover .slot-overlay { opacity: 1 !important; }
                                `}</style>
                                {(() => {
                                    const displayImages = [...(menuForm.gallery || ['', '', '', ''])];
                                    while (displayImages.length < 4) displayImages.push('');

                                    const renderSlot = (idx, isMain) => {
                                        const url = displayImages[idx];
                                        return (
                                            <div
                                                key={idx}
                                                className="gallery-slot"
                                                style={{
                                                    border: '4px solid black',
                                                    background: '#e0e0e0',
                                                    height: isMain ? '500px' : '150px',
                                                    position: 'relative',
                                                    marginBottom: isMain ? '20px' : 0,
                                                    boxShadow: isMain ? '8px 8px 0 0 black' : '4px 4px 0 0 black'
                                                }}
                                            >
                                                {url ? (
                                                    <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.3, fontWeight: 'bold' }}>
                                                        UPLOAD
                                                    </div>
                                                )}

                                                <div className="slot-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                                    <label style={{ background: 'white', color: 'black', padding: '10px 20px', cursor: 'pointer', border: '3px solid black', fontWeight: 'bold' }}>
                                                        <Upload size={20} /> UPLOAD
                                                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleGalleryUpload(idx, e.target.files[0])} />
                                                    </label>
                                                    {url && (
                                                        <button type="button" onClick={() => handleGalleryDelete(idx)} style={{ background: '#ff4444', color: 'white', padding: '10px 20px', border: '3px solid black', fontWeight: 'bold' }}>
                                                            <Trash2 size={20} /> DELETE
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    };

                                    return (
                                        <>
                                            {renderSlot(0, true)}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                                {renderSlot(1, false)}
                                                {renderSlot(2, false)}
                                                {renderSlot(3, false)}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Details Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>NAME</label>
                                    <input
                                        value={menuForm.name}
                                        onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                                        required
                                        style={{ width: '100%', fontSize: '1.5rem', padding: '15px', border: '4px solid black' }}
                                        placeholder="Item name..."
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>CATEGORY</label>
                                    <select
                                        value={menuForm.category}
                                        onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                                        style={{ width: '100%', fontSize: '1.2rem', padding: '15px', border: '4px solid black' }}
                                    >
                                        <option value="Featured">Featured</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        <option value="Uncategorized">Uncategorized</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>DESCRIPTION</label>
                                    <textarea
                                        value={menuForm.description}
                                        onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                                        rows="5"
                                        style={{ width: '100%', fontSize: '1rem', padding: '15px', border: '4px solid black', resize: 'vertical' }}
                                        placeholder="Item description..."
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>PRICE (Rp)</label>
                                    <input
                                        type="number"
                                        value={menuForm.price}
                                        onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                                        required
                                        style={{ width: '100%', fontSize: '1.5rem', padding: '15px', border: '4px solid black' }}
                                        placeholder="0"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsMenuModalOpen(false)}
                                        style={{ flex: 1, background: '#fff', fontSize: '1.2rem', padding: '15px', border: '2px solid black', cursor: 'pointer' }}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        className="primary"
                                        style={{ flex: 1, fontSize: '1.2rem', padding: '15px' }}
                                    >
                                        SAVE ITEM
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>ADD CATEGORY</h2>
                        <form onSubmit={handleCategorySubmit}>
                            <label>NAME</label>
                            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1 }}>CANCEL</button>
                                <button type="submit" className="primary" style={{ flex: 1 }}>ADD</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Menu Detail Modal (Brutalist Style) */}
            {viewingMenu && createPortal(
                <div className="modal-overlay" onClick={() => setViewingMenu(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '95%', height: '95vh', overflowY: 'auto', maxWidth: 'none', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '4px solid black', paddingBottom: '10px' }}>
                            {isManager ? (
                                <input
                                    value={menuForm.name}
                                    onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                                    style={{ fontSize: '2.5rem', fontWeight: 900, border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                                    placeholder="ITEM NAME"
                                />
                            ) : (
                                <h2 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>{viewingMenu.name}</h2>
                            )}
                            <button onClick={() => setViewingMenu(null)} style={{ background: 'black', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>X</button>
                        </div>

                        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', flex: 1 }}>
                            {/* Gallery Section */}
                            <div>
                                <style>{`
                                    .gallery-slot:hover .slot-overlay { opacity: 1 !important; }
                                `}</style>
                                {(() => {
                                    const sourceImages = isManager ? (menuForm.gallery || []) : (viewingMenu.gallery || []);
                                    const displayImages = [...sourceImages];
                                    if (displayImages.length === 0 && (isManager ? menuForm.imageUrl : viewingMenu.imageUrl)) {
                                        displayImages.push(isManager ? menuForm.imageUrl : viewingMenu.imageUrl);
                                    }
                                    while (displayImages.length < 4) displayImages.push('');

                                    const renderSlot = (idx, isMain) => {
                                        const url = displayImages[idx];
                                        return (
                                            <div
                                                key={idx}
                                                className="gallery-slot"
                                                style={{
                                                    border: '4px solid black',
                                                    background: '#e0e0e0',
                                                    height: isMain ? '500px' : '150px',
                                                    position: 'relative',
                                                    marginBottom: isMain ? '20px' : 0,
                                                    boxShadow: isMain ? '8px 8px 0 0 black' : '4px 4px 0 0 black'
                                                }}
                                            >
                                                {url ? (
                                                    <img src={url} alt={viewingMenu.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image" }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.3, fontWeight: 'bold' }}>
                                                        {isManager ? 'UPLOAD' : 'EMPTY'}
                                                    </div>
                                                )}

                                                {/* Hover Controls (Manager Only) */}
                                                {isManager && (
                                                    <div className="slot-overlay" style={{
                                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                        background: 'rgba(0,0,0,0.6)',
                                                        display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center',
                                                        transition: 'opacity 0.2s', opacity: 0
                                                    }}>
                                                        <label className="brutalist-btn" style={{ padding: '10px', cursor: 'pointer', background: 'white', border: '2px solid black' }}>
                                                            <Upload size={24} color="black" />
                                                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => { if (e.target.files[0]) handleGalleryUpload(idx, e.target.files[0]); }} />
                                                        </label>
                                                        {url && (
                                                            <button
                                                                className="danger"
                                                                style={{ padding: '10px', border: '2px solid black' }}
                                                                onClick={(e) => { e.stopPropagation(); handleGalleryDelete(idx); }}
                                                            >
                                                                <Trash2 size={24} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    };

                                    return (
                                        <>
                                            {renderSlot(0, true)}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                                {[1, 2, 3].map(idx => renderSlot(idx, false))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Details Section */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    {isManager ? (
                                        <select
                                            value={menuForm.category}
                                            onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                                            style={{ fontSize: '1.2rem', padding: '8px', border: '2px solid black', background: '#FCD34D', fontWeight: 'bold' }}
                                        >
                                            <option value="Featured">Featured</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            <option value="Uncategorized">Uncategorized</option>
                                        </select>
                                    ) : (
                                        <span className="badge" style={{ fontSize: '1.2rem', padding: '8px 15px', background: '#FCD34D' }}>
                                            {viewingMenu.category}
                                        </span>
                                    )}
                                </div>

                                {isManager ? (
                                    <textarea
                                        value={menuForm.description}
                                        onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                                        style={{ fontSize: '1.1rem', lineHeight: '1.6', flex: 1, fontWeight: 500, border: '2px solid black', padding: '15px', background: '#f9f9f9', boxShadow: '4px 4px 0 0 rgba(0,0,0,0.1)', height: '150px' }}
                                    />
                                ) : (
                                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', flex: 1, fontWeight: 500, border: '2px solid black', padding: '15px', background: '#f9f9f9', boxShadow: '4px 4px 0 0 rgba(0,0,0,0.1)' }}>
                                        {viewingMenu.description}
                                        <br /><br />
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>*Images shown are for illustration purposes. Presentation may vary.</span>
                                    </p>
                                )}

                                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                    {isManager ? (
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ fontWeight: 'bold' }}>PRICE (Rp)</label>
                                            <input
                                                type="number"
                                                value={menuForm.price}
                                                onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                                                style={{ fontSize: '2rem', padding: '5px', width: '100%', border: '2px solid black' }}
                                            />
                                        </div>
                                    ) : (
                                        <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>Rp {viewingMenu.price.toLocaleString()}</h3>
                                    )}

                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button
                                            style={{ flex: 1, background: '#fff', fontSize: '1.2rem', padding: '15px', border: '2px solid black', cursor: 'pointer' }}
                                            onClick={() => setViewingMenu(null)}
                                        >
                                            CLOSE
                                        </button>
                                        {isManager && (
                                            <button
                                                className="primary"
                                                style={{ flex: 1, fontSize: '1.2rem', padding: '15px' }}
                                                onClick={handleDetailSave}
                                            >
                                                SAVE
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {confirmDialog && createPortal(
                <div className="modal-overlay" onClick={() => setConfirmDialog(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '40px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '30px', textTransform: 'uppercase' }}>
                            {confirmDialog.message}
                        </h2>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                style={{
                                    flex: 1,
                                    background: '#fff',
                                    fontSize: '1.2rem',
                                    padding: '15px',
                                    border: '3px solid black',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => setConfirmDialog(null)}
                            >
                                CANCEL
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    background: confirmDialog.buttonColor || '#ff4444',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    padding: '15px',
                                    border: '3px solid black',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                                onClick={confirmDialog.onConfirm}
                            >
                                {confirmDialog.buttonText || 'DELETE'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {alertMsg && createPortal(
                <div className={`brutalist-alert ${alertMsg.type}`} style={{ paddingRight: '60px', paddingTop: '50px' }}>
                    {alertMsg.message}
                    <button
                        onClick={() => setAlertMsg(null)}
                        style={{
                            position: 'absolute',
                            right: '15px',
                            top: '15px',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            padding: '0',
                            color: 'inherit',
                            lineHeight: 1,
                            width: '30px',
                            height: '30px'
                        }}
                    >
                        ×
                    </button>
                </div>,
                document.body
            )}
        </div >
    );
}
