import { gql, useQuery } from '@apollo/client';
import { Card, Flex, Spin, Text } from '@gravity-ui/uikit';

const DASHBOARD = gql`
    query AdminDashboard {
        adminDashboard {
            usersTotal
            onlineNow
            balanceTotal
            depositsTotal
            withdrawalsTotal
            minesGamesTotal
            classicGamesTotal
        }
    }
`;

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n ?? 0);

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <Card style={{ padding: 20, minWidth: 190 }}>
            <Flex direction="column" gap={1}>
                <Text color="secondary" variant="body-1">
                    {label}
                </Text>
                <Text variant="display-1">{value}</Text>
            </Flex>
        </Card>
    );
}

export default function Dashboard() {
    const { data, loading } = useQuery(DASHBOARD, { fetchPolicy: 'cache-and-network' });

    if (loading && !data) {
        return <Spin size="l" />;
    }

    const d = data.adminDashboard;

    return (
        <Flex gap={4} wrap>
            <Stat label="Пользователей" value={fmt(d.usersTotal)} />
            <Stat label="Онлайн" value={fmt(d.onlineNow)} />
            <Stat label="Сумма балансов" value={`${fmt(d.balanceTotal)} ₽`} />
            <Stat label="Депозиты (всего)" value={`${fmt(d.depositsTotal)} ₽`} />
            <Stat label="Выводы (всего)" value={`${fmt(d.withdrawalsTotal)} ₽`} />
            <Stat label="Игр Mines" value={fmt(d.minesGamesTotal)} />
            <Stat label="Игр Classic" value={fmt(d.classicGamesTotal)} />
        </Flex>
    );
}
