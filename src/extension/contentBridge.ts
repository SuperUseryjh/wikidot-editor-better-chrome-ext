const INCLUDE_REQUEST_EVENT = 'wikidot-editor-better-include-request';
const INCLUDE_RESPONSE_EVENT = 'wikidot-editor-better-include-response';
const CONFIG_REQUEST_EVENT = 'wikidot-editor-better-config-request';
const CONFIG_RESPONSE_EVENT = 'wikidot-editor-better-config-response';

interface IncludeRequest {
    id?: string;
    url?: string;
    method?: 'GET' | 'POST';
    data?: string;
}

window.addEventListener(INCLUDE_REQUEST_EVENT, (event: Event) => {
    const detail = (event as CustomEvent<IncludeRequest>).detail;
    void chrome.runtime.sendMessage({ type: 'include-request', detail }).then((response: unknown) => {
        window.dispatchEvent(new CustomEvent(INCLUDE_RESPONSE_EVENT, { detail: response }));
    }).catch(() => {
        window.dispatchEvent(new CustomEvent(INCLUDE_RESPONSE_EVENT, {
            detail: { id: detail?.id, ok: false, text: '', debug: 'Chrome 扩展请求失败' },
        }));
    });
});

window.addEventListener(CONFIG_REQUEST_EVENT, () => {
    void chrome.storage.local.get('wikidot-editor-better-config').then((result: Record<string, unknown>) => {
        window.dispatchEvent(new CustomEvent(CONFIG_RESPONSE_EVENT, {
            detail: result['wikidot-editor-better-config'],
        }));
    });
});
