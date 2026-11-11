import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Flex, Label, Spin, Switch, Table, Text, TextInput } from '@gravity-ui/uikit';

const MAINTENANCE = gql`
    query AdminMaintenance {
        adminMaintenance
    }
`;

const DEPLOY = gql`
    query AdminDeploy {
        adminDeploy {
            branch
            latestSha
            githubConfigured
            targets {
                id
                name
                role
                enabled
                reachable
                deployedSha
                behind
                migrationPending
                sharedChanged
            }
        }
    }
`;

const SET_MAINTENANCE = gql`
    mutation SetMaintenance($on: Boolean!) {
        adminSetMaintenance(on: $on)
    }
`;

const ADD_TARGET = gql`
    mutation AddDeployTarget($name: String!, $role: String!, $versionUrl: String!, $deployUrl: String) {
        adminAddDeployTarget(name: $name, role: $role, versionUrl: $versionUrl, deployUrl: $deployUrl) {
            id
        }
    }
`;

const SET_TARGET_ENABLED = gql`
    mutation SetDeployTargetEnabled($id: ID!, $enabled: Boolean!) {
        adminSetDeployTargetEnabled(id: $id, enabled: $enabled) {
            id
            enabled
        }
    }
`;

const REMOVE_TARGET = gql`
    mutation RemoveDeployTarget($id: ID!) {
        adminRemoveDeployTarget(id: $id)
    }
`;

interface TargetStatus {
    id: string;
    name: string;
    role: string;
    enabled: boolean;
    reachable: boolean;
    deployedSha: string | null;
    behind: number | null;
    migrationPending: boolean;
    sharedChanged: boolean;
}

const short = (sha: string | null) => (sha ? sha.slice(0, 7) : '—');

export default function Deploy() {
    const maintenanceQ = useQuery(MAINTENANCE, { fetchPolicy: 'cache-and-network' });
    const deployQ = useQuery(DEPLOY, { fetchPolicy: 'cache-and-network', pollInterval: 15000 });
    const [setMaintenance] = useMutation(SET_MAINTENANCE);
    const [addTarget, { loading: adding }] = useMutation(ADD_TARGET);
    const [setEnabled] = useMutation(SET_TARGET_ENABLED);
    const [remove] = useMutation(REMOVE_TARGET);

    const [name, setName] = useState('');
    const [role, setRole] = useState('game');
    const [versionUrl, setVersionUrl] = useState('');
    const [deployUrl, setDeployUrl] = useState('');

    const maintenanceOn = Boolean(maintenanceQ.data?.adminMaintenance);

    const toggleMaintenance = async () => {
        await setMaintenance({ variables: { on: !maintenanceOn } });
        await maintenanceQ.refetch();
    };

    const onAdd = async () => {
        if (!name.trim() || !versionUrl.trim()) return;
        await addTarget({
            variables: {
                name: name.trim(),
                role: role.trim() || 'game',
                versionUrl: versionUrl.trim(),
                deployUrl: deployUrl.trim() || null,
            },
        });
        setName('');
        setVersionUrl('');
        setDeployUrl('');
        await deployQ.refetch();
    };

    const toggleTarget = async (t: TargetStatus) => {
        await setEnabled({ variables: { id: t.id, enabled: !t.enabled } });
        await deployQ.refetch();
    };

    const onRemove = async (t: TargetStatus) => {
        await remove({ variables: { id: t.id } });
        await deployQ.refetch();
    };

    const columns = [
        { id: 'name', name: 'Имя' },
        { id: 'role', name: 'Роль' },
        {
            id: 'reachable',
            name: 'Доступен',
            template: (t: TargetStatus) =>
                t.reachable ? <Label theme="success">да</Label> : <Label theme="danger">нет</Label>,
        },
        { id: 'deployedSha', name: 'Версия', template: (t: TargetStatus) => short(t.deployedSha) },
        {
            id: 'behind',
            name: 'Отставание',
            template: (t: TargetStatus) => {
                if (t.behind === null) return '—';
                if (t.behind === 0) return <Label theme="success">актуально</Label>;
                return <Label theme="warning">{`${t.behind} коммитов`}</Label>;
            },
        },
        {
            id: 'flags',
            name: 'Флаги',
            template: (t: TargetStatus) => (
                <Flex gap={1}>
                    {t.migrationPending && <Label theme="danger">миграция</Label>}
                    {t.sharedChanged && <Label theme="warning">общий слой</Label>}
                </Flex>
            ),
        },
        {
            id: 'enabled',
            name: 'Вкл',
            template: (t: TargetStatus) => <Switch checked={t.enabled} onUpdate={() => toggleTarget(t)} />,
        },
        {
            id: 'actions',
            name: '',
            template: (t: TargetStatus) => (
                <Button size="s" view="flat-danger" onClick={() => onRemove(t)}>
                    Удалить
                </Button>
            ),
        },
    ];

    const info = deployQ.data?.adminDeploy;

    return (
        <Flex direction="column" gap={5}>
            {/* Maintenance */}
            <Flex direction="column" gap={2}>
                <Text variant="subheader-2">Режим обслуживания</Text>
                <Flex gap={3} alignItems="center">
                    <Switch checked={maintenanceOn} onUpdate={toggleMaintenance} size="l" />
                    <Text color={maintenanceOn ? 'danger' : 'secondary'}>
                        {maintenanceOn ? 'Сайт закрыт: игроки видят страницу техработ, ставки заблокированы.' : 'Сайт открыт.'}
                    </Text>
                </Flex>
            </Flex>

            {/* Status */}
            <Flex direction="column" gap={3}>
                <Flex gap={3} alignItems="center">
                    <Text variant="subheader-2">Статус деплоя</Text>
                    {info && (
                        <Text color="secondary">
                            ветка {info.branch}, последний {short(info.latestSha)}
                        </Text>
                    )}
                </Flex>
                {info && !info.githubConfigured && (
                    <Text color="secondary" variant="caption-2">
                        GitHub-токен не настроен — отставание и флаги не вычисляются, показана только версия.
                    </Text>
                )}
                {deployQ.loading && !info ? (
                    <Spin size="l" />
                ) : (
                    <Table data={info?.targets ?? []} columns={columns} />
                )}
            </Flex>

            {/* Add target */}
            <Flex direction="column" gap={2}>
                <Text variant="subheader-2">Добавить таргет</Text>
                <Flex gap={2} alignItems="center" wrap>
                    <TextInput value={name} onUpdate={setName} placeholder="имя (game-vps2)" style={{ maxWidth: 180 }} />
                    <TextInput value={role} onUpdate={setRole} placeholder="роль (game/admin/auth)" style={{ maxWidth: 170 }} />
                    <TextInput
                        value={versionUrl}
                        onUpdate={setVersionUrl}
                        placeholder="versionUrl (http://10.0.0.2:3100)"
                        style={{ maxWidth: 280 }}
                    />
                    <TextInput
                        value={deployUrl}
                        onUpdate={setDeployUrl}
                        placeholder="deployUrl агента (опц.)"
                        style={{ maxWidth: 240 }}
                    />
                    <Button view="action" onClick={onAdd} loading={adding}>
                        Добавить
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
}
