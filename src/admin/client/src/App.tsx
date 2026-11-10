import { gql, useQuery } from '@apollo/client';
import { Flex, Spin } from '@gravity-ui/uikit';
import { Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Domains from './pages/Domains';

export const ADMIN_ME = gql`
    query AdminMe {
        adminMe {
            id
            username
            role
        }
    }
`;

export default function App() {
    const { data, loading, error } = useQuery(ADMIN_ME, { fetchPolicy: 'network-only' });

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh">
                <Spin size="l" />
            </Flex>
        );
    }

    if (error || !data?.adminMe) {
        return <Login />;
    }

    return (
        <Layout user={data.adminMe}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/domains" element={<Domains />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}
