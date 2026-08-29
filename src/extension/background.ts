interface PlatformRequestOptions {
    method?: 'GET' | 'POST';
    url?: string;
    headers?: Record<string, string>;
    data?: string;
    timeout?: number;
}

const MAX_INCLUDE_RESPONSE_LENGTH = 1_500_000;

function isAllowedIncludeUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'https:'
            && /^[a-z0-9-]+\.wikidot\.com$/i.test(url.hostname)
            && !url.search
            && !url.hash
            && /^\/$|^\/(?:ajax-module-connector\.php|[^/][^?#]*)$/.test(url.pathname);
    } catch {
        return false;
    }
}

function isAllowedRequest(options: PlatformRequestOptions): boolean {
    if (!options.url || !isAllowedIncludeUrl(options.url)) {
        return false;
    }
    const method = options.method === 'POST' ? 'POST' : 'GET';
    if (method === 'POST') {
        return Boolean(options.data && /^moduleName=viewsource%2FViewSourceModule&page_id=\d+&wikidot_token7=[a-f0-9]+$/i.test(options.data));
    }
    return true;
}

async function fetchWithTimeout(options: PlatformRequestOptions): Promise<{ ok: boolean; status: number; text: string; headers: string; error?: 'network' | 'timeout' }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout ?? 10_000);
    try {
        const response = await fetch(options.url!, {
            method: options.method === 'POST' ? 'POST' : 'GET',
            credentials: 'include',
            headers: options.method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : undefined,
            body: options.method === 'POST' ? options.data : undefined,
            signal: controller.signal,
        });
        const text = (await response.text()).slice(0, MAX_INCLUDE_RESPONSE_LENGTH);
        return { ok: response.ok, status: response.status, text, headers: '' };
    } catch (error) {
        const kind: 'network' | 'timeout' = (error as Error).name === 'AbortError' ? 'timeout' : 'network';
        return { ok: false, status: 0, text: '', headers: '', error: kind };
    } finally {
        clearTimeout(timer);
    }
}

chrome.runtime.onMessage.addListener((message: { type?: string; options?: PlatformRequestOptions; url?: string; name?: string }) => {
    if (message.type === 'platform-request' && message.options) {
        if (!isAllowedRequest(message.options)) {
            return { ok: false, status: 0, text: '', headers: '', error: 'network' };
        }
        return fetchWithTimeout(message.options);
    }
    if (message.type === 'platform-read-cookie' && message.url && message.name && isAllowedIncludeUrl(message.url)) {
        return chrome.cookies.get({ url: message.url, name: message.name }).then((cookie) => cookie?.value);
    }
    return undefined;
});
