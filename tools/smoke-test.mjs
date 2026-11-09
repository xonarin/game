#!/usr/bin/env node
/**
 * Smoke test for the local dev stack (docker-compose.dev.yml). No dependencies, Node 18+.
 *
 *   node tools/smoke-test.mjs [baseUrl] [wsUrl]
 *   defaults: http://localhost:3100  ws://localhost:3002/graphql
 *
 * Covers: pages and redirects, dev login + session cookie, GraphQL queries,
 * a full Mines round (start -> step -> win/lose), game chat read + send rules,
 * Telegram signature rejection, WebSocket subscription handshake.
 * Gives the test user a balance through MySQL in the `mysql` compose service.
 */
import { execFileSync } from 'node:child_process';

const BASE = process.argv[2] || 'http://localhost:3100';
const WS_URL = process.argv[3] || 'ws://localhost:3002/graphql';
const TEST_USER = 'smoke';

let failed = 0;
const ok = (name, cond, details = '') => {
    if (cond) {
        console.info(`  ok   ${name}`);
    } else {
        failed++;
        console.error(`  FAIL ${name} ${details}`);
    }
};

const get = (path, cookie) =>
    fetch(BASE + path, { redirect: 'manual', headers: cookie ? { cookie } : {} });

const gql = async (cookie, query, variables) => {
    const res = await fetch(`${BASE}/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
        body: JSON.stringify({ query, variables }),
    });
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        // e.g. an invalid session cookie makes express-jwt answer with an HTML error page
        return { errors: [{ message: `HTTP ${res.status}, non-JSON response` }] };
    }
};

const sql = statement =>
    execFileSync(
        'docker',
        ['compose', '-f', 'docker-compose.dev.yml', 'exec', '-T', 'mysql', 'mysql', '-uroot', '-pdev', '-N', 'playtime', '-e', statement],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();

const pages = async () => {
    console.info('pages');
    const home = await get('/');
    ok('/ renders the lobby', home.status === 200 && (await home.text()).includes('Все игры'), `status ${home.status}`);
    const login = await get('/login');
    ok('/login renders', login.status === 200, `status ${login.status}`);
    const casino = await get('/casino');
    ok('/casino -> 301 /', casino.status === 301 && new URL(casino.headers.get('location'), BASE).pathname === '/');
    const mines = await get('/mines');
    ok('/mines as guest -> /login', mines.status === 302 && casino.headers.get('location') !== null && mines.headers.get('location').endsWith('/login'));
    for (const removed of ['/classic', '/messages', '/auth-wait']) {
        // eslint-disable-next-line no-await-in-loop
        const r = await get(removed);
        ok(`${removed} is gone (404)`, r.status === 404, `status ${r.status}`);
    }
    // Forged FreeKassa notification signed with empty secrets must not be accepted
    const { createHash } = await import('node:crypto');
    const forgedSign = createHash('md5').update(':100::1').digest('hex');
    const kassa = await fetch(`${BASE}/api/v1/kassa/notify`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ MERCHANT_ID: '', AMOUNT: '100', MERCHANT_ORDER_ID: '1', SIGN: forgedSign }),
    });
    ok('forged payment notification is rejected', (await kassa.text()).trim() !== 'YES', `status ${kassa.status}`);
    const tg = await get('/auth/telegram/return?id=1&auth_date=1&hash=deadbeef');
    ok('telegram login rejects a bad signature', tg.status === 302 && !(tg.headers.get('set-cookie') || '').includes('idToken'));
};

const login = async () => {
    console.info('auth');
    const res = await get(`/auth/dev?user=${TEST_USER}`);
    const setCookie = res.headers.get('set-cookie') || '';
    const token = /idToken=([^;]+)/.exec(setCookie);
    ok('dev login sets a session cookie', res.status === 302 && Boolean(token), `status ${res.status}`);
    if (!token) return null;
    const cookie = `idToken=${token[1]}`;
    const me = await gql(cookie, '{ me { id username money } }');
    ok('me returns the logged-in user', me.data && me.data.me && me.data.me.username === TEST_USER, JSON.stringify(me.errors || ''));
    const anon = await gql(null, '{ me { id } }');
    ok('me is null without a session', anon.data && anon.data.me === null);
    const forged = await gql('idToken=eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEifQ.forged', '{ me { id } }');
    ok('forged token is not accepted', !(forged.data && forged.data.me));
    return { cookie, id: me.data && me.data.me && me.data.me.id };
};

const mines = async ({ cookie, id }) => {
    console.info('mines');
    sql(`UPDATE MinesGame SET status='Ended' WHERE userId=${Number(id)} AND status='InGame'; UPDATE User SET money=100 WHERE id=${Number(id)}`);
    const F = 'id status stepsConf fieldConf';
    const cfg = await gql(cookie, '{ minesGameConfiguration { fieldSize minBombsCount } }');
    ok('minesGameConfiguration', cfg.data && cfg.data.minesGameConfiguration.fieldSize === 25);
    const start = await gql(cookie, `mutation($i: StartMinesGameInput!) { startMinesGame(input: $i) { ${F} } }`, {
        i: { betAmount: 1, bombsCount: 2 },
    });
    ok('startMinesGame', start.data && start.data.startMinesGame.status === 'InGame', JSON.stringify(start.errors || ''));
    const step = await gql(cookie, `mutation($c: Int!) { makeMinesGameStep(cell: $c) { ${F} } }`, { c: 7 });
    const s = step.data && step.data.makeMinesGameStep;
    ok('makeMinesGameStep', Boolean(s), JSON.stringify(step.errors || ''));
    if (s && s.status === 'InGame') {
        const end = await gql(cookie, `mutation { endMinesGame { ${F} } }`);
        ok('endMinesGame (cash out)', end.data && end.data.endMinesGame.status === 'Ended', JSON.stringify(end.errors || ''));
    }
    const money = Number(sql(`SELECT money FROM User WHERE id=${Number(id)}`));
    ok('balance changed after the round', money !== 100 && money > 0, `money=${money}`);
    const tooHigh = await gql(cookie, `mutation($i: StartMinesGameInput!) { startMinesGame(input: $i) { ${F} } }`, {
        i: { betAmount: -5, bombsCount: 2 },
    });
    ok('negative bet is rejected', Boolean(tooHigh.errors));
};

const chat = async ({ cookie }) => {
    console.info('chat');
    const chatId = sql("SELECT id FROM Chat WHERE type='Game' ORDER BY id LIMIT 1");
    const read = await gql(null, 'query($id: ID!) { chat(chatId: $id) { id type messagesCount } }', { id: chatId });
    ok('guest can read the game chat', read.data && read.data.chat.type === 'Game', JSON.stringify(read.errors || ''));
    const guestSend = await gql(null, 'mutation($i: SendMessageInput!) { sendMessage(input: $i) { id } }', {
        i: { chatId, message: 'hi' },
    });
    ok('guest cannot send messages', Boolean(guestSend.errors));
    const userSend = await gql(cookie, 'mutation($i: SendMessageInput!) { sendMessage(input: $i) { id } }', {
        i: { chatId, message: 'smoke test' },
    });
    const sent = Boolean(userSend.data && userSend.data.sendMessage);
    const blocked = JSON.stringify(userSend.errors || '').includes('SEND_MESSAGE_NOT_ENOUGH_DEPS');
    ok('user send follows the deposit rule', sent || blocked, JSON.stringify(userSend.errors || ''));
};

const websocket = () =>
    new Promise(resolve => {
        console.info('websocket');
        // graphql-transport-ws (graphql-ws lib) first, legacy subscriptions-transport-ws as a fallback
        const tryProtocol = (protocols, rest) => {
            let done = false;
            const ws = new WebSocket(WS_URL, protocols);
            const finish = (result, label) => {
                if (done) return;
                done = true;
                try {
                    ws.close();
                } catch {
                    // ignore
                }
                if (result || rest.length === 0) {
                    ok(`subscription handshake (${label})`, result);
                    resolve();
                } else {
                    tryProtocol(rest[0], rest.slice(1));
                }
            };
            const timer = setTimeout(() => finish(false, protocols), 5000);
            ws.onopen = () => ws.send(JSON.stringify({ type: 'connection_init', payload: {} }));
            ws.onmessage = e => {
                const msg = JSON.parse(e.data);
                if (msg.type === 'connection_ack') {
                    clearTimeout(timer);
                    finish(true, ws.protocol || protocols);
                }
            };
            ws.onerror = () => {
                clearTimeout(timer);
                finish(false, protocols);
            };
        };
        tryProtocol('graphql-transport-ws', ['graphql-ws']);
    });

const main = async () => {
    console.info(`smoke test against ${BASE}`);
    await pages();
    const session = await login();
    if (session) {
        await mines(session);
        await chat(session);
    }
    await websocket();
    console.info(failed ? `\n${failed} check(s) FAILED` : '\nall checks passed');
    process.exit(failed ? 1 : 0);
};

main().catch(e => {
    console.error(e);
    process.exit(1);
});
