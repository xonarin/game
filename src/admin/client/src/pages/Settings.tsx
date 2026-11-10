import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Dialog, Flex, Spin, Table, Text, TextInput } from '@gravity-ui/uikit';

const SETTINGS = gql`
    query AdminSettings {
        adminSettings {
            name
            value
            description
        }
    }
`;

const UPDATE = gql`
    mutation AdminUpdateSetting($name: String!, $value: String!) {
        adminUpdateSetting(name: $name, value: $value) {
            name
            value
        }
    }
`;

interface Row {
    name: string;
    value: string | null;
    description: string | null;
}

export default function Settings() {
    const { data, loading, refetch } = useQuery(SETTINGS, { fetchPolicy: 'cache-and-network' });
    const [update, { loading: saving }] = useMutation(UPDATE);

    const [editing, setEditing] = useState<Row | null>(null);
    const [value, setValue] = useState('');

    const openEdit = (row: Row) => {
        setEditing(row);
        setValue(row.value ?? '');
    };

    const save = async () => {
        if (!editing) return;
        await update({ variables: { name: editing.name, value } });
        setEditing(null);
        await refetch();
    };

    const columns = [
        { id: 'name', name: 'Ключ' },
        { id: 'value', name: 'Значение', template: (r: Row) => r.value ?? '—' },
        { id: 'description', name: 'Описание', template: (r: Row) => r.description ?? '' },
        {
            id: 'actions',
            name: '',
            template: (r: Row) => (
                <Button size="s" onClick={() => openEdit(r)}>
                    Изменить
                </Button>
            ),
        },
    ];

    if (loading && !data) {
        return <Spin size="l" />;
    }

    return (
        <Flex direction="column" gap={4}>
            <Text variant="subheader-2">Настройки</Text>
            <Table data={data.adminSettings} columns={columns} />

            <Dialog open={Boolean(editing)} onClose={() => setEditing(null)}>
                <Dialog.Header caption={editing ? editing.name : ''} />
                <Dialog.Body>
                    <Flex direction="column" gap={3}>
                        {editing?.description && <Text color="secondary">{editing.description}</Text>}
                        <TextInput value={value} onUpdate={setValue} placeholder="Значение" />
                    </Flex>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={() => setEditing(null)}
                    onClickButtonApply={save}
                    textButtonApply="Сохранить"
                    textButtonCancel="Отмена"
                    propsButtonApply={{ loading: saving }}
                />
            </Dialog>
        </Flex>
    );
}
