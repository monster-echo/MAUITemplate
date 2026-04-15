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

function formatAsset(asset: NativeMediaAsset) {
  const sizeKb = Math.max(asset.fileSizeBytes / 1024, 0).toFixed(1);
  return `${asset.fileName} · ${asset.contentType} · ${sizeKb} KB`;
}

export default function PhotosFeaturePage() {
  const [previewAsset, setPreviewAsset] = useState<NativeMediaAsset | null>(
    null,
  );
  const [resultTitle, setResultTitle] = useState("还没有选择图片");
  const [resultDetail, setResultDetail] =
    useState("这里会显示最近一次图片选择结果。");

  const pickPhoto = async () => {
    try {
      const asset = await nativeBridge.pickPhoto();
      setResultTitle("图片选择结果");
      setResultDetail(asset ? formatAsset(asset) : "你取消了图片选择。");
      if (asset) {
        setPreviewAsset(asset);
      }
      return asset;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle("图片选择结果");
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
          <IonTitle>图片</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>图片入口</IonCardTitle>
            <IonCardSubtitle>调用系统相册与读取元数据</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            当前模板先返回文件名、类型和大小，后续你可以继续扩展成预览、上传或裁剪流程。
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>相册示例</IonLabel>
          </IonListHeader>
          <IonItem button detail onClick={() => void pickPhoto()}>
            <IonLabel>
              <h2>从系统相册选择</h2>
              <p>打开系统照片选择器。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const asset = await pickPhoto();
                if (asset) {
                  await nativeBridge.showToastWithDuration(
                    `已选择：${asset.fileName}`,
                    "short",
                  );
                }
              })()
            }
          >
            <IonLabel>
              <h2>选择后提示 Toast</h2>
              <p>选择成功后立即给用户轻量反馈。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const asset = await pickPhoto();
                if (asset) {
                  await nativeBridge.setStringValue(
                    "template.photos.last",
                    formatAsset(asset),
                  );
                  setResultTitle("图片缓存结果");
                  setResultDetail(`已缓存：${formatAsset(asset)}`);
                }
              })()
            }
          >
            <IonLabel>
              <h2>选择并缓存元数据</h2>
              <p>把最近一次选图结果存到原生 Preferences。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void (async () => {
                const cached = await nativeBridge.getStringValue(
                  "template.photos.last",
                );
                setResultTitle("最近一次缓存图片");
                setResultDetail(cached || "当前还没有缓存过图片元数据。");
              })()
            }
          >
            <IonLabel>
              <h2>读取最近一次缓存</h2>
              <p>验证图片结果已成功落到原生存储。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <MediaPreviewCard
          asset={previewAsset}
          emptyTitle="还没有图片预览"
          emptyDetail="选图成功后，这里会显示刚刚选择的图片。"
        />

        <ActionResultCard
          title={resultTitle}
          detail={resultDetail}
          note="如果返回 null，通常表示用户取消了选择；成功时图片会被复制到应用缓存，方便直接预览。"
        />
      </IonContent>
    </IonPage>
  );
}
