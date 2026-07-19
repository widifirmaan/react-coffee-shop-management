import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Trash2, Star, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import PageHeader from '../components/ui/PageHeader';
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [alertMsg, setAlertMsg] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get('/api/feedbacks');
            setFeedbacks(res.data);
        } catch (e) {
            console.error("Failed to fetch feedbacks", e);
        }
    };

    const handleDelete = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'DELETE FEEDBACK',
            message: 'Are you sure you want to delete this feedback?',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/feedbacks/${id}`);
                    setAlertMsg({ type: 'success', message: 'FEEDBACK DELETED!' });
                    fetchFeedbacks();
                } catch (e) {
                    setAlertMsg({ type: 'error', message: 'FAILED TO DELETE FEEDBACK' });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }
        });
    };

    // Calculate Average Rating
    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0.0';

    // Pagination
    const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = feedbacks.slice(startIndex, startIndex + itemsPerPage);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill={i < rating ? "#eab308" : "none"} color={i < rating ? "#eab308" : "#ccc"} />
        ));
    };

    return (
        <div className="page-container">
            <PageHeader
                title="CUSTOMER FEEDBACK"
                description="REVIEWS & SUGGESTIONS"
                icon={MessageSquare}
                color="#e9d5ff"
                action={null}
            />

            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>DATE</Th>
                            <Th>MESSAGE</Th>
                            <Th>SHIFT STAFF</Th>
                            <Th>ACTION</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {paginatedData.map((fb, idx) => (
                            <Tr key={fb.id} index={idx}>
                                <Td style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                    {new Date(fb.timestamp).toLocaleDateString()} <br />
                                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>{new Date(fb.timestamp).toLocaleTimeString()}</span>
                                </Td>
                                <Td style={{ maxWidth: '400px' }}>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>"{fb.message}"</div>
                                </Td>
                                <Td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {(fb.shiftEmployees || []).map((staff, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.75rem',
                                                background: 'black',
                                                color: 'white',
                                                padding: '2px 6px',
                                                fontWeight: 'bold'
                                            }}>
                                                {staff}
                                            </span>
                                        ))}
                                        {(!fb.shiftEmployees || fb.shiftEmployees.length === 0) && <span style={{ opacity: 0.5 }}>-</span>}
                                    </div>
                                </Td>
                                <Td>
                                    <Button onClick={() => handleDelete(fb.id)} variant="danger" style={{ padding: '8px' }}>
                                        <Trash2 size={16} />
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                        {feedbacks.length === 0 && (
                            <Tr>
                                <Td colSpan="5" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>NO FEEDBACK FOUND</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>

            {feedbacks.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={feedbacks.length}
                />
            )}

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
