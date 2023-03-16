/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';

export default function Submit() {
    const [product, setProduct] = useState('');
    const [repNumber, setRepNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerId, setOwnerId] = useState('');

    if (typeof window !== 'undefined') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        useEffect(() => {
            setProduct(urlParams.get('product'));
            setRepNumber(urlParams.get('rep'));
            setClientName(urlParams.get('clientName'));
            setOwnerName(urlParams.get('ownerName'));
            setOwnerId(urlParams.get('id'));
        }, [urlParams]);
    }

    return (
        <div>
            Submit Page Here
            <p>product: {product}</p>
            <p>number: {repNumber}</p>
            <p>clientName: {clientName}</p>
            <p>ownerName: {ownerName}</p>
            <p>id: {ownerId}</p>
        </div>
    );
}
