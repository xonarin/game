import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Dialog, Flex, Spin, Table, Text, TextInput } from '@gravity-ui/uikit';

const USERS = gql`
    query AdminUsers($search: String) {
        adminUsers(search: $search, limit: 50) {
            total
            items {
                id
                username
                role
                socialType
                money
                turnover
            }
        }
    }
`;

const ADJUST = gql`
    mutation AdminAdjustBalance($userId: ID!, $amount: Float!, $reason: String) {
        adminAdjustBalance(userId: $userId, amount: $amount, reason: $reason) {
            id
            money
        }
    }
`;

interface Row {
    id: string;
    username: string;
    role: string;
    socialType: string;
    money: number;
    turnover: number;
}

export default function Users() {
    const [search, setSearch] = useState('');
    const { data, loading, refetch } = useQuery(USERS, { variables: { search: search || null } });
    const [adjust, { loading: saving }] = useMutation(ADJUST);

    const [editing, setEditing] = useState<Row | null>(null);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const openEdit = (row: Row) => {
        setEditing(row);
        setAmount('');
        setReason('');
    };

    const save = async () => {
        const amt = Number(amount);
        if (!editing || !Number.isFinite(amt) || amt === 0) return;
        await adjust({ variables: { userId: editing.id, amount: amt, reason: reason || null } });
        setEditing(null);
        await refetch();
    };

    const columns = [
        { id: 'id', name: 'ID' },
        { id: 'username', name: 'Имя' },
        { id: 'role', name: 'Роль' },
        { id: 'socialType', name: 'Вход' },
        { id: 'money', name: 'Баланс', template: (r: Row) => `${r.money} ₽` },
        { id: 'turnover', name: 'Оборот', template: (r: Row) => `${r.turnover} ₽` },
        {
            id: 'actions',
            name: '',
            template: (r: Row) => (
                <Button size="s" onClick={() => openEdit(r)}>
                    Баланс
                </Button>
            ),
        },
    ];

    return (
        <Flex direction="column" gap={4}>
            <Flex gap={3} alignItems="center">
                <TextInput
                    value={search}
                    onUpdate={setSearch}
                    placeholder="Поиск: имя, id, соц. id"
                    style={{ maxWidth: 320 }}
                />
                <Text color="secondary">Всего: {data?.adminUsers.total ?? '—'}</Text>
            </Flex>

            {loading && !data ? <Spin size="l" /> : <Table data={data.adminUsers.items} columns={columns} />}

            <Dialog open={Boolean(editing)} onClose={() => setEditing(null)}>
                <Dialog.Header caption={editing ? `Баланс: ${editing.username}` : ''} />
                <Dialog.Body>
                    <Flex direction="column" gap={3}>
                        <Text color="secondary">
                            Текущий баланс: {editing?.money} ₽. Сумма может быть отрицательной (списание).
                        </Text>
                        <TextInput type="number" value={amount} onUpdate={setAmount} placeholder="+/- сумма" />
                        <TextInput value={reason} onUpdate={setReason} placeholder="Причина (в аудит)" />
                    </Flex>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setEditing(null)}
                    onClickButtonApply={save}
                    textButtonApply="Применить"
                    textButtonCancel="Отмена"
                    propsButtonApply={{ loading: saving }}
                />
            </Dialog>
        </Flex>
    );
}
