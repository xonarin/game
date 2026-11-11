/**
 * Deploy agent — a tiny, self-contained service that runs on EACH VPS next to its app.
 * The admin deploy panel calls POST /deploy with the shared secret; the agent runs the
 * configured deploy command (e.g. tools/deploy/deploy.sh) and returns its output.
 *
 * Deliberately independent of the app (no DB/config imports) so it keeps working even if the
 * app is broken. Bind it to the PRIVATE interface only (never public) and protect with a secret.
 *
 * Env:
 *   DEPLOY_AGENT_PORT    (default 9000)
 *   DEPLOY_AGENT_SECRET  (required; same secret the admin uses)
 *   DEPLOY_COMMAND       (shell command to run, e.g. "bash tools/deploy/deploy.sh")
 *   DEPLOY_APP           (label: game|admin|auth)
 */
import crypto from 'crypto';
import { exec } from 'child_process';
import express from 'express';

const PORT = Number(process.env.DEPLOY_AGENT_PORT || 9000);
const SECRET = (process.env.DEPLOY_AGENT_SECRET || '').trim();
const COMMAND = (process.env.DEPLOY_COMMAND || '').trim();
const APP = process.env.DEPLOY_APP || 'app';
const TIMEOUT_MS = 10 * 60 * 1000;

const safeEqual = (a: string, b: string) => {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

let running = false;

const app = express();
app.use(express.json());

app.get('/agent/health', (_0, res) => {
    res.json({ ok: true, app: APP, busy: running });
});

app.post('/deploy', (req, res) => {
    const secret = (req.header('x-deploy-secret') || '').trim();
    if (!SECRET || !safeEqual(secret, SECRET)) {
        res.status(401).json({ ok: false, error: 'bad secret' });
        return;
    }
    if (!COMMAND) {
        res.status(500).json({ ok: false, error: 'DEPLOY_COMMAND is not configured' });
        return;
    }
    if (running) {
        res.status(409).json({ ok: false, error: 'deploy already in progress' });
        return;
    }

    running = true;
    console.info(`[deploy-agent:${APP}] starting deploy`);
    exec(COMMAND, { env: process.env, timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        running = false;
        const output = `${stdout}\n${stderr}`.trim().slice(-8000);
        if (err) {
            console.error(`[deploy-agent:${APP}] deploy failed:`, err.message);
            res.status(500).json({ ok: false, app: APP, output, error: String(err.message || err) });
            return;
        }
        console.info(`[deploy-agent:${APP}] deploy ok`);
        res.json({ ok: true, app: APP, output });
    });
});

app.listen(PORT, () => {
    console.info(`[deploy-agent:${APP}] listening on :${PORT}`);
    if (!SECRET) console.warn('[deploy-agent] DEPLOY_AGENT_SECRET is not set — refusing all deploys');
});
