declare namespace chrome {
    namespace runtime {
        function sendMessage(message: unknown): Promise<any>;
        const onMessage: {
            addListener(callback: (message: any) => unknown): void;
        };
    }

    namespace storage {
        namespace local {
            function get(key: string): Promise<Record<string, unknown>>;
            function set(items: Record<string, unknown>): Promise<void>;
        }
    }

    namespace cookies {
        function get(details: { url: string; name: string }): Promise<{ value: string } | null>;
    }
}
