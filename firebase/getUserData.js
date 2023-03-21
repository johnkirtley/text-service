/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import {
    collection, getDocs, query, where, doc, orderBy, limit,
} from 'firebase/firestore';
import { firestore } from './clientApp';

export const querySubCollection = async (parentCollection, field, operator, value, subCollection) => {
    const parentQuery = query(collection(firestore, parentCollection), where(field, operator, value));
    const parentQuerySnapshot = await getDocs(parentQuery);

    const results = [];
    for (const parentDoc of parentQuerySnapshot.docs) {
        const subCollectionRef = collection(doc(firestore, parentCollection, parentDoc.id), subCollection);
        const subQuery = query(subCollectionRef, orderBy('created', 'desc'), limit(1));
        const subQuerySnapshot = await getDocs(subQuery);
        const mostRecentSubDoc = subQuerySnapshot.docs.length > 0 ? { id: subQuerySnapshot.docs[0].id, ...subQuerySnapshot.docs[0].data() } : null;

        results.push({
            id: parentDoc.id,
            data: parentDoc.data(),
            mostRecentSubDoc,
        });
    }
    return results;
};

export default querySubCollection;
