import { ReactNode } from 'react';
import { Button, Flex, Text } from '@gravity-ui/uikit';
import { NavLink, useLocation } from 'react-router-dom';

const NAV = [
    { to: '/', label: 'Дашборд' },
    { to: '/users', label: 'Пользователи' },
    { to: '/settings', label: 'Настройки' },
    { to: '/domains', label: 'Домены' },
    { to: '/deploy', label: 'Деплой' },
];

interface LayoutProps {
    user: { username: string; role: string };
    children: ReactNode;
}

export default function Layout({ user, children }: LayoutProps) {
    const { pathname } = useLocation();

    return (
        <Flex direction="column" style={{ height: '100vh' }}>
            <Flex
                alignItems="center"
                justifyContent="space-between"
                style={{ padding: '12px 20px', borderBottom: '1px solid var(--g-color-line-generic)' }}
            >
                <Flex gap={3} alignItems="center">
                    <Text variant="subheader-2">Админка PlayTime</Text>
                    {NAV.map(item => {
                        const active = pathname === item.to;
                        return (
                            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none' }} end={item.to === '/'}>
                                <Button view={active ? 'normal' : 'flat'} selected={active}>
                                    {item.label}
                                </Button>
                            </NavLink>
                        );
                    })}
                </Flex>
                <Flex gap={3} alignItems="center">
                    <Text color="secondary">
                        {user.username} · {user.role}
                    </Text>
                    <Button view="flat" href="/logout">
                        Выйти
                    </Button>
                </Flex>
            </Flex>
            <div style={{ padding: 20, overflow: 'auto', flex: 1 }}>{children}</div>
        </Flex>
    );
}
