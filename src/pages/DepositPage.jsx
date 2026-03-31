import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionModal from '../components/TransactionModal';

function DepositPage() {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/dashboard');
    };

    return (
        <TransactionModal
            initialTab="deposit"
            onClose={handleClose}
            onSuccess={() => {
                // Determine logic: maybe wait a bit then go back?
                // TransactionModal already handles delay before calling onSuccess/onClose
            }}
        />
    );
}

export default DepositPage;
