import { NextPage } from 'next';
import { TransactionDetail } from '../../components/TransactionDetail';

const TransactionPage: NextPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <TransactionDetail />
        </div>
    );
};

export default TransactionPage;
