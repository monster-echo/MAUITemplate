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
import { useState } from "react";
import { nativeBridge, type NativeMediaAsset } from "../../bridge/nativeBridge";
import ActionResultCard from "../../components/ActionResultCard";
import MediaPreviewCard from "../../components/MediaPreviewCard";
import { useAppStore } from "../../store/appStore";

function formatAsset(asset: NativeMediaAsset) {
  const sizeMb = Math.max(asset.fileSizeBytes / (1024 * 1024), 0).toFixed(2);
  return `${asset.fileName} · ${asset.contentType} · ${sizeMb} MB`;
}

export default function VideoFeaturePage() {
  const bridgeCapabilities = useAppStore((state) => state.bridgeCapabilities);
  const [previewAsset, setPreviewAsset] = useState<NativeMediaAsset | null>(
    null,
  );
  const [resultTitle, setResultTitle] = useState("还没有选择视频");
  const [resultDetail, setResultDetail] = useState(
    "这里会显示最近一次视频选择或拍摄结果。",
  );

  const handleResult = (title: string, asset: NativeMediaAsset | null) => {
    setResultTitle(title);
    setResultDetail(asset ? formatAsset(asset) : "你取消了当前操作。");
    if (asset) {
      setPreviewAsset(asset);
    }
    return asset;
  };

  const pickVideo = async () => {
    try {
      const asset = await nativeBridge.pickVideo();
      return handleResult("视频选择结果", asset);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle("视频选择结果");
      setResultDetail(`调用失败：${message}`);
      return null;
    }
  };

  const captureVideo = async () => {
    try {
      const asset = await nativeBridge.captureVideo();
      return handleResult("视频拍摄结果", asset);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle("视频拍摄结果");
      setResultDetail(`调用失败：${message}`);
      return null;
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>视频</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>视频入口</IonCardTitle>
            <IonCardSubtitle>
              选择或拍摄视频，并在 Web 层直接预览。
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            视频选择支持：{bridgeCapabilities?.videoLibrary ? "是" : "否"}
            <br />
            视频拍摄支持：{bridgeCapabilities?.videoCapture ? "是" : "否"}
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>视频示例</IonLabel>
          </IonListHeader>
          <IonItem button detail onClick={() => void pickVideo()}>
            <IonLabel>
              <h2>从系统中选择视频</h2>
              <p>选择后复制到应用缓存并提供预览。</p>
            </IonLabel>
          </IonItem>
          <IonItem button detail onClick={() => void captureVideo()}>
            <IonLabel>
              <h2>打开系统相机拍视频</h2>
              <p>演示视频拍摄回传与预览链路。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const asset = await pickVideo();
                if (asset) {
                  await nativeBridge.setStringValue(
                    "template.video.last",
                    formatAsset(asset),
                  );
                  setResultTitle("视频缓存结果");
                  setResultDetail(`已缓存：${formatAsset(asset)}`);
                }
              })()
            }
          >
            <IonLabel>
              <h2>缓存最近一次视频元数据</h2>
              <p>把最近一次视频结果写进原生 Preferences。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const cached = await nativeBridge.getStringValue(
                  "template.video.last",
                );
                setResultTitle("最近一次视频缓存");
                setResultDetail(cached || "当前还没有缓存过视频元数据。");
              })()
            }
          >
            <IonLabel>
              <h2>读取最近一次视频缓存</h2>
              <p>验证视频结果已成功写入原生存储。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <MediaPreviewCard
          asset={previewAsset}
          emptyTitle="还没有视频预览"
          emptyDetail="选择视频或拍视频后，这里会直接显示播放器。"
        />

        <ActionResultCard
          title={resultTitle}
          detail={resultDetail}
          note="视频文件通常更大；当前模板会复制一份到缓存目录用于预览。"
        />
      </IonContent>
    </IonPage>
  );
}
