interface IncludeRequest {
    id?: string;
    url?: string;
    method?: 'GET' | 'POST';
    data?: string;
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

function isAllowedIncludeRequest(detail: IncludeRequest): boolean {
    if (!detail.id || !/^[a-z0-9-]+$/i.test(detail.id) || !detail.url || !isAllowedIncludeUrl(detail.url)) {
        return false;
    }
    return detail.method !== 'POST'
        || Boolean(detail.data && /^moduleName=viewsource%2FViewSourceModule&page_id=\d+&wikidot_token7=[a-f0-9]+$/i.test(detail.data));
}

chrome.runtime.onMessage.addListener((message: { type?: string; detail?: IncludeRequest }) => {
    if (message.type !== 'include-request' || !message.detail || !isAllowedIncludeRequest(message.detail)) {
        return undefined;
    }
    const { id, url, data } = message.detail;
    const method = message.detail.method === 'POST' ? 'POST' : 'GET';
    return fetch(url!, {
        method,
        credentials: 'include',
        headers: method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : undefined,
        body: method === 'POST' ? data : undefined,
    }).then(async (response) => {
        const text = (await response.text()).slice(0, MAX_INCLUDE_RESPONSE_LENGTH);
        const cookie = await chrome.cookies.get({ url: url!, name: 'wikidot_token7' });
        return { id, ok: response.ok, text, debug: `HTTP ${response.status}`, token: cookie?.value };
    }).catch(() => ({ id, ok: false, text: '', debug: '网络请求失败' }));
});
