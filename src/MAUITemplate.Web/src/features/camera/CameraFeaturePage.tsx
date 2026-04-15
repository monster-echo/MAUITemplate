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
import { useAppStore } from "../../store/appStore";
import ActionResultCard from "../../components/ActionResultCard";
import MediaPreviewCard from "../../components/MediaPreviewCard";

function formatAsset(asset: NativeMediaAsset) {
  const sizeKb = Math.max(asset.fileSizeBytes / 1024, 0).toFixed(1);
  return `${asset.fileName} · ${asset.contentType} · ${sizeKb} KB`;
}

export default function CameraFeaturePage() {
  const bridgeCapabilities = useAppStore((state) => state.bridgeCapabilities);
  const [previewAsset, setPreviewAsset] = useState<NativeMediaAsset | null>(
    null,
  );
  const [resultTitle, setResultTitle] = useState("还没有调用相机");
  const [resultDetail, setResultDetail] =
    useState("这里会显示最近一次拍照结果。");

  const capturePhoto = async () => {
    try {
      const asset = await nativeBridge.capturePhoto();
      setResultTitle("相机拍照结果");
      setResultDetail(asset ? formatAsset(asset) : "你取消了拍照。");
      if (asset) {
        setPreviewAsset(asset);
      }
      return asset;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle("相机拍照结果");
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
          <IonTitle>相机</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>相机入口</IonCardTitle>
            <IonCardSubtitle>调用系统相机并回传元数据</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            当前设备相机支持：{bridgeCapabilities?.camera ? "是" : "否"}
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>相机示例</IonLabel>
          </IonListHeader>
          <IonItem button detail onClick={() => void capturePhoto()}>
            <IonLabel>
              <h2>打开系统相机</h2>
              <p>拍照后把文件元数据传回 Web 层。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const asset = await capturePhoto();
                if (asset) {
                  await nativeBridge.showToastWithDuration(
                    `已拍照：${asset.fileName}`,
                    "short",
                  );
                }
              })()
            }
          >
            <IonLabel>
              <h2>拍照后提示 Toast</h2>
              <p>适合做“拍照成功”的即时反馈。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const asset = await capturePhoto();
                if (asset) {
                  await nativeBridge.setStringValue(
                    "template.camera.last",
                    formatAsset(asset),
                  );
                  setResultTitle("相机缓存结果");
                  setResultDetail(`已缓存：${formatAsset(asset)}`);
                }
              })()
            }
          >
            <IonLabel>
              <h2>拍照并缓存元数据</h2>
              <p>把最近一次拍照结果保存到原生存储。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const cached = await nativeBridge.getStringValue(
                  "template.camera.last",
                );
                setResultTitle("最近一次相机缓存");
                setResultDetail(cached || "当前还没有缓存过拍照元数据。");
              })()
            }
          >
            <IonLabel>
              <h2>读取最近一次缓存</h2>
              <p>验证相机结果已成功写入原生 Preferences。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <MediaPreviewCard
          asset={previewAsset}
          emptyTitle="还没有相机预览"
          emptyDetail="拍照成功后，这里会显示最近一次拍到的图片。"
        />

        <ActionResultCard
          title={resultTitle}
          detail={resultDetail}
          note="首次使用时系统可能会请求相机权限；拍到的图片会复制到缓存目录，保证 Web 侧可以预览。"
        />
      </IonContent>
    </IonPage>
  );
}
