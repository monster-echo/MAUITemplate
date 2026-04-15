import React from "react";
import { createRoot } from "react-dom/client";
import "./bridge/hybridwebview";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);

const sendAppReady = () => {
  try {
    const host = (window as any).HybridWebView;
    if (host?.SendRawMessage) {
      host.SendRawMessage(JSON.stringify({ type: "appReady" }));
    }
  } catch (error) {
    console.warn("Failed to send appReady", error);
  }
};

const sendAppInit = () => {
  try {
    const host = (window as any).HybridWebView;
    if (host?.SendRawMessage) {
      host.SendRawMessage(JSON.stringify({ type: "appInit" }));
    }
  } catch (error) {
    console.warn("Failed to send appInit", error);
  }
};

const renderApp = (initialData?: unknown) => {
  root.render(
    <React.StrictMode>
      <App initialData={initialData as { platform?: string } | undefined} />
    </React.StrictMode>,
  );
};

const initDataHandler = (event: Event) => {
  const customEvent = event as CustomEvent;
  const raw = customEvent.detail?.message;
  if (!raw) {
    return;
  }

  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (data?.type !== "initData") {
    return;
  }

  window.removeEventListener("HybridWebViewMessageReceived", initDataHandler);
  (window as any).initData = data.payload;
  renderApp(data.payload);
  sendAppReady();
};

window.addEventListener("HybridWebViewMessageReceived", initDataHandler);
sendAppInit();
