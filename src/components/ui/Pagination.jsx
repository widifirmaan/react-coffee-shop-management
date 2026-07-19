import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            padding: '20px',
            border: '4px solid black',
            background: 'white',
            boxShadow: '8px 8px 0 0 black'
        }}>
            {/* Info */}
            <div className="pagination-info" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                SHOWING {startItem}-{endItem} OF {totalItems}
            </div>

            {/* Page Controls */}
            <div className="pagination-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Button
                    variant="secondary"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 12px' }}
                >
                    <ChevronLeft size={18} />
                </Button>

                <div className="pagination-numbers" style={{ display: 'flex', gap: '5px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={currentPage === page ? 'active' : ''}
                            style={{
                                padding: '8px 12px',
                                border: '2px solid black',
                                background: currentPage === page ? 'black' : 'white',
                                color: currentPage === page ? 'white' : 'black',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                minWidth: '40px',
                                boxShadow: currentPage === page ? 'none' : '4px 4px 0 0 rgba(0,0,0,0.2)'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <Button
                    variant="secondary"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px 12px' }}
                >
                    <ChevronRight size={18} />
                </Button>
            </div>

            {/* Items per page - Hide on mobile */}
            <div className="pagination-page-count" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                PAGE {currentPage} / {totalPages}
            </div>
        </div>
    );
}
