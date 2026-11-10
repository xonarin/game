import { useState } from 'react';
import { Button, Card, Flex, Text, TextInput } from '@gravity-ui/uikit';

const ERRORS: Record<string, string> = {
    not_admin: 'Этот аккаунт не является администратором.',
    vk: 'Не удалось войти через VK ID.',
    vk_disabled: 'Вход через VK ID не настроен.',
    google: 'Не удалось войти через Google.',
    google_disabled: 'Вход через Google не настроен.',
    steam: 'Не удалось войти через Steam.',
    steam_disabled: 'Вход через Steam не настроен.',
    telegram: 'Не удалось войти через Telegram.',
};

export default function Login() {
    const error = new URLSearchParams(window.location.search).get('error') || '';
    const [devUser, setDevUser] = useState('admin');

    return (
        <Flex justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
            <Card style={{ padding: 32, width: 380 }}>
                <Flex direction="column" gap={4}>
                    <Text variant="header-1">Вход в админку</Text>
                    {error && <Text color="danger">{ERRORS[error] || 'Ошибка входа.'}</Text>}

                    <Flex direction="column" gap={2}>
                        <Button size="l" view="action" href="/auth/vk">
                            Войти через VK ID
                        </Button>
                        <Button size="l" href="/auth/google">
                            Войти через Google
                        </Button>
                        <Button size="l" href="/auth/steam">
                            Войти через Steam
                        </Button>
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
