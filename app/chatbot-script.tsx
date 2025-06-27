"use client";

import Script from "next/script";

declare global {
  function activateEmbeddedChatbot(config: {
    theme: string;
    position: string;
    isTestingMode: boolean;
  }): void;
}

export default function ChatbotScript() {
  return (
    <Script
      src="https://promptbook.studio/api/embed/miniapp.js?id=5e408aff-6fc5-42f1-9db9-fa8601c626ae"
      strategy="afterInteractive"
      onLoad={() => {
        activateEmbeddedChatbot({
          "theme": "LIGHT",
          "position": "BOTTOM_RIGHT",
          "isTestingMode": false
        });
      }}
    />
  );
}
