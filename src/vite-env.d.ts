/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

/** The slice of Google Identity Services (accounts.google.com/gsi/client) we use. */
interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
        }): void;
        renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
        disableAutoSelect(): void;
      };
    };
  };
}
