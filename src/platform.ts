/**
 * 平台能力适配层（Chrome 扩展 content script 侧）。
 * 跨域请求与 cookie 读取通过 chrome.runtime.sendMessage 转发给 background 执行。
 * 与油猴版本共享同一套接口，仅实现不同。
 */

export interface PlatformRequestOptions {
    method: 'GET' | 'POST';
    url: string;
    headers?: Record<string, string>;
    data?: string;
    timeout?: number;
}

export interface PlatformRequestResult {
    ok: boolean;
    status: number;
    text: string;
    headers: string;
    finalUrl?: string;
    error?: 'network' | 'timeout';
}

export async function platformRequest(options: PlatformRequestOptions): Promise<PlatformRequestResult> {
    try {
        return await chrome.runtime.sendMessage({ type: 'platform-request', options }) as PlatformRequestResult;
    } catch {
        return { ok: false, status: 0, text: '', headers: '', error: 'network' };
    }
}

export async function platformReadCookie(url: string, name: string): Promise<string | undefined> {
    try {
        return await chrome.runtime.sendMessage({ type: 'platform-read-cookie', url, name }) as string | undefined;
    } catch {
        return undefined;
    }
}
