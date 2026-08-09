/**
 * 全局类型声明：Monaco 运行时对象、AMD require 等
 */
export {};

declare global {
    interface Window {
        require?: any;
        define?: any;
        MonacoEnvironment?: any;
        monaco?: any;
        // wikidot 全局
        WIKIDOT?: any;
        $?: any;
        $j?: any;
        OZONE?: any;
        YAHOO?: any;
    }
}
