/**
 * 常量定义
 */
export const MONACO_VERSION = '0.52.2';
export const MONACO_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;

export const EDIT_TEXTAREA_ID = 'edit-page-textarea';
export const MONACO_CONTAINER_ID = 'wikidot-monaco-container';
export const MONACO_STATUS_ID = 'wikidot-monaco-status';
export const MONACO_ERROR_ID = 'wikidot-monaco-error';
export const EDITOR_STYLE_ID = 'wikidot-monaco-style';
export const EDITOR_CONFIG_KEY = 'wikidotEditorBetterConfig';
export const MONACO_RETRY_DELAYS = [1000, 3000, 8000] as const;

export const FONT_SIZE_KEY = 'wikidotMonacoFontSize';
export const DEFAULT_FONT_SIZE = 14;
export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 30;

export const WIKIDOT_LANGUAGE_ID = 'wikidot';
