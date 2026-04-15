import {
  IonBackButton,
  IonBadge,
  IonButton,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { nativeBridge } from "../../bridge/nativeBridge";
import ActionResultCard from "../../components/ActionResultCard";
import "./BridgeStreamFeaturePage.css";

type StreamChunk = {
  streamId: string;
  sequence: number;
  chunkCount: number;
  byteLength: number;
  checksum: string;
  base64: string;
  sentAt: string;
};

type StreamPreset = {
  label: string;
  chunkByteLength: number;
  chunkCount: number;
  intervalMs: number;
};

const streamPresets: StreamPreset[] = [
  {
    label: "轻量流",
    chunkByteLength: 128,
    chunkCount: 12,
    intervalMs: 180,
  },
  {
    label: "标准流",
    chunkByteLength: 512,
    chunkCount: 18,
    intervalMs: 220,
  },
  {
    label: "大块流",
    chunkByteLength: 2048,
    chunkCount: 10,
    intervalMs: 320,
  },
];

function base64ToHexPreview(base64: string, maxBytes = 16) {
  try {
    const binary = atob(base64);
    return Array.from(binary.slice(0, maxBytes))
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");
  } catch {
    return "<invalid-base64>";
  }
}

export default function BridgeStreamFeaturePage() {
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusTitle, setStatusTitle] = useState("还没有启动流式传输");
  const [statusDetail, setStatusDetail] = useState(
    "点击下方预设按钮，JS 会向 C# 下发开始命令，随后 C# 连续推送二进制 chunk 到这里。",
  );
  const [commandTitle, setCommandTitle] = useState("尚未发送命令");
  const [commandDetail, setCommandDetail] = useState(
    "这里会记录最近一次 JS 发给 C# 的流式控制命令。",
  );
  const [chunks, setChunks] = useState<StreamChunk[]>([]);

  useEffect(() => {
    currentStreamIdRef.current = currentStreamId;
  }, [currentStreamId]);

  useEffect(() => {
    const onNativeMessage = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const raw = customEvent.detail?.message;
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;

        if (!data || !String(data.type ?? "").startsWith("bridgeStream.")) {
          return;
        }

        if (data.type === "bridgeStream.started") {
          setCurrentStreamId(data.streamId ?? null);
          setIsStreaming(true);
          setChunks([]);
          setStatusTitle("C# 已开始推流");
          setStatusDetail(JSON.stringify(data, null, 2));
          return;
        }

        if (data.type === "bridgeStream.chunk") {
          const nextChunk = data as StreamChunk;
          setCurrentStreamId(nextChunk.streamId);
          setIsStreaming(true);
          setChunks((current) => [nextChunk, ...current].slice(0, 24));
          setStatusTitle(
            `正在接收二进制流（${nextChunk.sequence + 1}/${nextChunk.chunkCount}）`,
          );
          setStatusDetail(
            `streamId=${nextChunk.streamId}\nbyteLength=${nextChunk.byteLength}\nchecksum=${nextChunk.checksum}`,
          );
          return;
        }

        if (data.type === "bridgeStream.completed") {
          if (
            data.streamId &&
            currentStreamIdRef.current &&
            data.streamId !== currentStreamIdRef.current
          ) {
            return;
          }

          setIsStreaming(false);
          setCurrentStreamId(null);
          setStatusTitle("C# 推流完成");
          setStatusDetail(JSON.stringify(data, null, 2));
          return;
        }

        if (data.type === "bridgeStream.stopped") {
          if (
            data.streamId &&
            currentStreamIdRef.current &&
            data.streamId !== currentStreamIdRef.current
          ) {
            return;
          }

          setIsStreaming(false);
          setCurrentStreamId(null);
          setStatusTitle("C# 已停止推流");
          setStatusDetail(JSON.stringify(data, null, 2));
          return;
        }

        if (data.type === "bridgeStream.error") {
          setIsStreaming(false);
          setCurrentStreamId(null);
          setStatusTitle("推流失败");
          setStatusDetail(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.warn("Failed to parse bridge stream message", error);
      }
    };

    window.addEventListener("HybridWebViewMessageReceived", onNativeMessage);

    return () => {
      nativeBridge.sendRaw({
        type: "bridgeStream.stop",
        source: "js",
        sentAt: new Date().toISOString(),
      });
      window.removeEventListener(
        "HybridWebViewMessageReceived",
        onNativeMessage,
      );
    };
  }, []);

  const totalBytes = useMemo(
    () => chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0),
    [chunks],
  );

  const startStream = (preset: StreamPreset) => {
    setCommandTitle(`JS 已下发开始命令：${preset.label}`);
    setCommandDetail(JSON.stringify(preset, null, 2));
    nativeBridge.sendRaw({
      type: "bridgeStream.start",
      source: "js",
      ...preset,
      sentAt: new Date().toISOString(),
    });
  };

  const stopStream = () => {
    setCommandTitle("JS 已下发停止命令");
    setCommandDetail(`streamId=${currentStreamId ?? "<none>"}`);
    nativeBridge.sendRaw({
      type: "bridgeStream.stop",
      source: "js",
      streamId: currentStreamId,
      sentAt: new Date().toISOString(),
    });
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/bridge" />
          </IonButtons>
          <IonTitle>流式二进制桥接</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>JS 命令 → C# 连续推流</IonCardTitle>
            <IonCardSubtitle>
              这个页面专门演示“JS 发控制命令，C# 不断发送二进制给 JS”。
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            当前状态：
            <IonBadge color={isStreaming ? "success" : "medium"}>
              {isStreaming ? "推流中" : "空闲"}
            </IonBadge>
            <div className="bridge-stream-page__summary">
              最近缓存 chunk：{chunks.length} 个，总字节数：{totalBytes}
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>发送命令</IonCardTitle>
            <IonCardSubtitle>
              下面三个按钮都会让 JS 发送开始命令给 C#。
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="bridge-stream-page__actions">
              {streamPresets.map((preset) => (
                <IonButton
                  key={preset.label}
                  onClick={() => startStream(preset)}
                >
                  {preset.label}
                </IonButton>
              ))}
              <IonButton color="warning" fill="outline" onClick={stopStream}>
                停止推流
              </IonButton>
              <IonButton
                color="medium"
                fill="clear"
                onClick={() => setChunks([])}
              >
                清空展示
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <ActionResultCard title={commandTitle} detail={commandDetail} />
        <ActionResultCard title={statusTitle} detail={statusDetail} />

        <IonList inset>
          <IonListHeader>
            <IonLabel>最近收到的二进制 chunk</IonLabel>
          </IonListHeader>
          {chunks.length === 0 ? (
            <IonItem>
              <IonLabel>
                <h2>还没有收到数据</h2>
                <p>启动一个流之后，这里会持续追加 C# 推过来的二进制块。</p>
              </IonLabel>
            </IonItem>
          ) : (
            chunks.map((chunk) => (
              <IonItem key={`${chunk.streamId}-${chunk.sequence}`}>
                <IonLabel>
                  <h2>
                    chunk #{chunk.sequence + 1}
                    <IonBadge style={{ marginLeft: 8 }} color="primary">
                      {chunk.byteLength} bytes
                    </IonBadge>
                  </h2>
                  <p>streamId: {chunk.streamId}</p>
                  <p>checksum: {chunk.checksum}</p>
                  <p>hex 预览: {base64ToHexPreview(chunk.base64)}</p>
                  <p>sentAt: {chunk.sentAt}</p>
                </IonLabel>
              </IonItem>
            ))
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
