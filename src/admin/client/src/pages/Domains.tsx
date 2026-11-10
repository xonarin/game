import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Flex, Spin, Switch, Table, Text, TextInput } from '@gravity-ui/uikit';

const CLIENTS = gql`
    query AdminAuthClients {
        adminAuthClients {
            id
            origin
            label
            enabled
            createdAt
        }
    }
`;

const ADD = gql`
    mutation AddAuthClient($origin: String!, $label: String) {
        adminAddAuthClient(origin: $origin, label: $label) {
            id
        }
    }
`;

const SET_ENABLED = gql`
    mutation SetAuthClientEnabled($id: ID!, $enabled: Boolean!) {
        adminSetAuthClientEnabled(id: $id, enabled: $enabled) {
            id
            enabled
        }
    }
`;

const REMOVE = gql`
    mutation RemoveAuthClient($id: ID!) {
        adminRemoveAuthClient(id: $id)
    }
`;

interface Client {
    id: string;
    origin: string;
    label: string | null;
    enabled: boolean;
}

export default function Domains() {
    const { data, loading, refetch } = useQuery(CLIENTS, { fetchPolicy: 'cache-and-network' });
    const [add, { loading: adding }] = useMutation(ADD);
    const [setEnabled] = useMutation(SET_ENABLED);
    const [remove] = useMutation(REMOVE);

    const [origin, setOrigin] = useState('');
    const [label, setLabel] = useState('');

    const onAdd = async () => {
        if (!origin.trim()) return;
        await add({ variables: { origin: origin.trim(), label: label.trim() || null } });
        setOrigin('');
        setLabel('');
        await refetch();
    };

    const toggle = async (row: Client) => {
        await setEnabled({ variables: { id: row.id, enabled: !row.enabled } });
        await refetch();
    };

    const onRemove = async (row: Client) => {
        await remove({ variables: { id: row.id } });
        await refetch();
    };

    const columns = [
        { id: 'origin', name: 'Домен (origin)' },
        { id: 'label', name: 'Подпись', template: (r: Client) => r.label ?? '' },
        {
            id: 'enabled',
            name: 'Включён',
            template: (r: Client) => <Switch checked={r.enabled} onUpdate={() => toggle(r)} />,
        },
        {
            id: 'actions',
            name: '',
            template: (r: Client) => (
                <Button size="s" view="flat-danger" onClick={() => onRemove(r)}>
                    Удалить
                </Button>
            ),
        },
    ];

    return (
        <Flex direction="column" gap={4}>
            <Text variant="subheader-2">Домены, которым разрешён вход через auth-сервис</Text>

            <Flex gap={2} alignItems="center">
                <TextInput
                    value={origin}
                    onUpdate={setOrigin}
                    placeholder="https://site.com"
                    style={{ maxWidth: 320 }}
                />
                <TextInput value={label} onUpdate={setLabel} placeholder="подпись (необязательно)" style={{ maxWidth: 240 }} />
                <Button view="action" onClick={onAdd} loading={adding}>
                    Добавить
                </Button>
            </Flex>

            {loading && !data ? <Spin size="l" /> : <Table data={data.adminAuthClients} columns={columns} />}
        </Flex>
    );
}
