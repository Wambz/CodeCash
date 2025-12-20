import React from 'react';
import { useNavigate } from 'react-router-dom';
import DepositModal from '../components/DepositModal';

function DepositPage() {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/dashboard');
    };

    return (
        <DepositModal
            onClose={handleClose}
            onSuccess={() => {
                // Determine logic: maybe wait a bit then go back?
                // DepositModal already handles delay before calling onSuccess/onClose
                // So we can just relying on onClose being called or call handleClose here
            }}
        />
    );
}

export default DepositPage;
