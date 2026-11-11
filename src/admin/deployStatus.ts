import config from '../config';
import { DeployTarget } from '../data/models/DeployTarget';

export interface TargetStatus {
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

export interface DeployInfo {
    branch: string;
    latestSha: string | null;
    githubConfigured: boolean;
    targets: TargetStatus[];
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, ms = 4000): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const githubGet = async (path: string): Promise<any> => {
    const resp = await fetchWithTimeout(`https://api.github.com${path}`, {
        headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${config.deploy.githubToken}`,
            'user-agent': 'playtime-admin',
        },
    });
    if (!resp.ok) {
        throw new Error(`github ${resp.status}`);
    }
    return resp.json();
};

/** True when a changed file belongs to the shared layer that both apps embed. */
const isSharedFile = (file: string) => file.startsWith('src/data/') || file.startsWith('packages/core/');

export const getDeployInfo = async (targets: DeployTarget[]): Promise<DeployInfo> => {
    const { githubRepo, githubBranch, githubToken } = config.deploy;
    const githubConfigured = Boolean(githubRepo && githubToken);

    let latestSha: string | null = null;
    if (githubConfigured) {
        try {
            const head = await githubGet(`/repos/${githubRepo}/commits/${encodeURIComponent(githubBranch)}`);
            latestSha = head.sha || null;
        } catch {
            latestSha = null;
        }
    }

    const statuses = await Promise.all(
        targets.map(async (target): Promise<TargetStatus> => {
            let reachable = false;
            let deployedSha: string | null = null;
            try {
                const resp = await fetchWithTimeout(`${target.versionUrl}/version`);
                const body = await resp.json();
                reachable = resp.ok;
                deployedSha = body.sha || null;
            } catch {
                reachable = false;
            }

            let behind: number | null = null;
            let migrationPending = false;
            let sharedChanged = false;

            if (deployedSha && latestSha && deployedSha === latestSha) {
                behind = 0;
            } else if (githubConfigured && latestSha && deployedSha) {
                try {
                    const cmp = await githubGet(`/repos/${githubRepo}/compare/${deployedSha}...${latestSha}`);
                    behind = typeof cmp.ahead_by === 'number' ? cmp.ahead_by : null;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const files: string[] = (cmp.files || []).map((f: any) => f.filename as string);
                    migrationPending = files.some(f => f.startsWith('migrations/'));
                    sharedChanged = files.some(isSharedFile);
                } catch {
                    behind = null;
                }
            }

            return {
                id: target.id,
                name: target.name,
                role: target.role,
                enabled: target.enabled,
                reachable,
                deployedSha,
                behind,
                migrationPending,
                sharedChanged,
            };
        }),
    );

    return { branch: githubBranch, latestSha, githubConfigured, targets: statuses };
};
