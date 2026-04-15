import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { nativeBridge } from "../../bridge/nativeBridge";
import ActionResultCard from "../../components/ActionResultCard";

function createDemoBinary(byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  for (let index = 0; index < byteLength; index += 1) {
    bytes[index] = index % 256;
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function summarizeBase64(base64: string, byteLength: number) {
  return `byteLength=${byteLength}\nbase64=${base64.slice(0, 48)}${base64.length > 48 ? "..." : ""}`;
}

export default function BridgeFeaturePage() {
  const [resultTitle, setResultTitle] = useState("还没有调用 bridge");
  const [resultDetail, setResultDetail] = useState(
    "这里会显示最近一次 JS ↔ C# 调用结果。",
  );
  const [incomingTitle, setIncomingTitle] = useState("还没有收到 C# 主动推送");
  const [incomingDetail, setIncomingDetail] = useState(
    "这里会显示最近一次 C# → JS 的文本或二进制消息。",
  );

  useEffect(() => {
    const onNativeMessage = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const raw = customEvent.detail?.message;
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!data || !String(data.type ?? "").startsWith("bridgeDemo.")) {
          return;
        }

        if (data.type === "bridgeDemo.text") {
          setIncomingTitle("收到 C# 文本消息");
          setIncomingDetail(JSON.stringify(data, null, 2));
          return;
        }

        if (data.type === "bridgeDemo.binary") {
          setIncomingTitle("收到 C# 二进制消息");
          setIncomingDetail(
            `${JSON.stringify(
              {
                ...data,
                base64: undefined,
              },
              null,
              2,
            )}\n${summarizeBase64(data.base64 ?? "", data.byteLength ?? 0)}`,
          );
          return;
        }

        if (data.type === "bridgeDemo.response") {
          setIncomingTitle(`收到 C# 回应：${data.direction}`);
          setIncomingDetail(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.warn("Failed to parse bridge demo message", error);
      }
    };

    window.addEventListener("HybridWebViewMessageReceived", onNativeMessage);
    return () => {
      window.removeEventListener(
        "HybridWebViewMessageReceived",
        onNativeMessage,
      );
    };
  }, []);

  const runAction = async (title: string, action: () => Promise<string>) => {
    try {
      const detail = await action();
      setResultTitle(title);
      setResultDetail(detail);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle(title);
      setResultDetail(`调用失败：${message}`);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>JS 和 C# 交互</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Bridge 入口</IonCardTitle>
            <IonCardSubtitle>
              覆盖调用、回推、文本与二进制四种链路
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            这里不再展示诊断，而是专注验证 JS 调 C#、C# 回推
            JS，以及双向二进制消息。
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>信息读取</IonLabel>
          </IonListHeader>
          <IonItem button detail routerLink="/bridge/stream">
            <IonLabel>
              <h2>打开流式二进制演示页</h2>
              <p>JS 下发开始/停止命令，C# 持续把二进制 chunk 推给 JS 展示。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("读取平台信息", async () => {
                const info = await nativeBridge.getPlatformInfo();
                return JSON.stringify(info, null, 2);
              })
            }
          >
            <IonLabel>
              <h2>读取平台信息</h2>
              <p>最轻量的平台类型信息。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("读取应用信息", async () => {
                const info = await nativeBridge.getAppInfo();
                return JSON.stringify(info, null, 2);
              })
            }
          >
            <IonLabel>
              <h2>读取应用信息</h2>
              <p>应用名、包名、支持邮箱等。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("读取系统信息", async () => {
                const info = await nativeBridge.getSystemInfo();
                return JSON.stringify(info, null, 2);
              })
            }
          >
            <IonLabel>
              <h2>读取系统信息</h2>
              <p>平台、版本、设备型号等。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("读取 bridge 能力", async () => {
                const capabilities = await nativeBridge.getCapabilities();
                return JSON.stringify(capabilities, null, 2);
              })
            }
          >
            <IonLabel>
              <h2>读取 bridge 能力</h2>
              <p>查看当前宿主暴露了哪些原生能力。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>JS 调用 C#</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("键值往返测试", async () => {
                const value = `bridge-demo-${Date.now()}`;
                await nativeBridge.setStringValue(
                  "template.bridge.demo",
                  value,
                );
                const roundtrip = await nativeBridge.getStringValue(
                  "template.bridge.demo",
                );
                return `写入：${value}\n读取：${roundtrip}`;
              })
            }
          >
            <IonLabel>
              <h2>键值往返测试</h2>
              <p>验证 JS → C# → Preferences → JS 的完整链路。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("JS 调用 C# 文本回声", async () => {
                const result = await nativeBridge.echoText(
                  `hello-from-js-${Date.now()}`,
                );
                return JSON.stringify(result, null, 2);
              })
            }
          >
            <IonLabel>
              <h2>JS 调用 C#：文本</h2>
              <p>通过 InvokeDotNet 调用 C#，拿回结构化文本结果。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("JS 调用 C# 二进制回声", async () => {
                const bytes = createDemoBinary(32);
                const result = await nativeBridge.echoBinary(
                  bytesToBase64(bytes),
                );
                return `${JSON.stringify(
                  {
                    ...result,
                    base64: undefined,
                  },
                  null,
                  2,
                )}\n${summarizeBase64(result.base64, result.byteLength)}`;
              })
            }
          >
            <IonLabel>
              <h2>JS 调用 C#：二进制</h2>
              <p>把 Uint8Array 编码后发给 C#，再从 C# 回传校验结果。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>JS raw → C# raw</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("JS raw 文本消息", async () => {
                const text = `raw-js-${Date.now()}`;
                nativeBridge.sendRaw({
                  type: "bridgeDemo.text",
                  source: "js",
                  text,
                  sentAt: new Date().toISOString(),
                });
                return `已通过 raw message 把文本发给 C#：${text}`;
              })
            }
          >
            <IonLabel>
              <h2>JS raw 发文本给 C#</h2>
              <p>不走 InvokeDotNet，直接让 C# 监听原始消息并回应。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("JS raw 二进制消息", async () => {
                const bytes = createDemoBinary(20);
                const base64 = bytesToBase64(bytes);
                nativeBridge.sendRaw({
                  type: "bridgeDemo.binary",
                  source: "js",
                  byteLength: bytes.length,
                  base64,
                  sentAt: new Date().toISOString(),
                });
                return `已通过 raw message 把二进制发给 C#。\n${summarizeBase64(base64, bytes.length)}`;
              })
            }
          >
            <IonLabel>
              <h2>JS raw 发二进制给 C#</h2>
              <p>演示 JS 往 C# 发送二进制载荷并等待 C# 回应。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>C# → JS</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("C# 主动推送文本到 JS", async () => {
                await nativeBridge.sendTextMessageToJs(
                  `hello-from-csharp-${Date.now()}`,
                );
                return "已请求 C# 主动向 JS 推送文本消息。";
              })
            }
          >
            <IonLabel>
              <h2>C# 主动推送文本到 JS</h2>
              <p>点击后由 C# 发起消息，JS 页面会收到并显示。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("C# 主动推送二进制到 JS", async () => {
                await nativeBridge.sendBinaryMessageToJs(40);
                return "已请求 C# 主动向 JS 推送二进制消息。";
              })
            }
          >
            <IonLabel>
              <h2>C# 主动推送二进制到 JS</h2>
              <p>让 C# 生成字节数组并发送给 JS 侧展示。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <ActionResultCard title={resultTitle} detail={resultDetail} />
        <ActionResultCard
          title={incomingTitle}
          detail={incomingDetail}
          note="这一块显示的是 C# 主动发到 JS，或 C# 对 JS raw 消息的回应。"
        />
      </IonContent>
    </IonPage>
  );
}
