import { useEffect, useState } from 'react';
import { Button, Card, Flex, Text, TextInput } from '@gravity-ui/uikit';

const ERRORS: Record<string, string> = {
    not_admin: 'Этот аккаунт не является администратором.',
    auth: 'Не удалось войти. Попробуйте ещё раз.',
    vk: 'Не удалось войти через VK ID.',
    google: 'Не удалось войти через Google.',
    steam: 'Не удалось войти через Steam.',
    telegram: 'Не удалось войти через Telegram.',
};

export default function Login() {
    const error = new URLSearchParams(window.location.search).get('error') || '';
    const [devUser, setDevUser] = useState('admin');
    const [authServiceUrl, setAuthServiceUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/public-config')
            .then(r => r.json())
            .then(c => setAuthServiceUrl(c.authServiceUrl || null))
            .catch(() => setAuthServiceUrl(null));
    }, []);

    const origin = window.location.origin;
    const go = (type: string) =>
        authServiceUrl
            ? `${authServiceUrl}/go?from=${encodeURIComponent(origin)}&type=${type}`
            : `/auth/${type === 'tg' ? 'vk' : type}`;

    return (
        <Flex justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
            <Card style={{ padding: 32, width: 380 }}>
                <Flex direction="column" gap={4}>
                    <Text variant="header-1">Вход в админку</Text>
                    {error && <Text color="danger">{ERRORS[error] || 'Ошибка входа.'}</Text>}

                    <Flex direction="column" gap={2}>
                        <Button size="l" view="action" href={go('vk')}>
                            Войти через VK ID
                        </Button>
                        <Button size="l" href={go('google')}>
                            Войти через Google
                        </Button>
                        <Button size="l" href={go('steam')}>
                            Войти через Steam
                        </Button>
                        {authServiceUrl && (
                            <Button size="l" href={go('tg')}>
                                Войти через Telegram
                            </Button>
                        )}
                    </Flex>

                    <form method="get" action="/auth/dev">
                        <Flex gap={2} alignItems="center">
                            <TextInput name="user" value={devUser} onUpdate={setDevUser} placeholder="dev-пользователь" />
                            <Button type="submit">Dev вход</Button>
                        </Flex>
                    </form>

                    <Text color="secondary" variant="caption-2">
                        Доступ только для аккаунтов с ролью admin.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    );
}
