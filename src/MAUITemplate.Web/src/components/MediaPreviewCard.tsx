import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonNote,
} from "@ionic/react";
import type { NativeMediaAsset } from "../bridge/nativeBridge";
import "./MediaPreviewCard.css";

export interface MediaPreviewCardProps {
  asset: NativeMediaAsset | null;
  emptyTitle?: string;
  emptyDetail?: string;
}

function isImage(asset: NativeMediaAsset) {
  return asset.contentType.startsWith("image/");
}

function isVideo(asset: NativeMediaAsset) {
  return asset.contentType.startsWith("video/");
}

export default function MediaPreviewCard({
  asset,
  emptyTitle = "还没有可预览的媒体",
  emptyDetail = "选择或拍摄后，这里会显示最近一次媒体预览。",
}: MediaPreviewCardProps) {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{asset ? "媒体预览" : emptyTitle}</IonCardTitle>
        <IonCardSubtitle>
          {asset ? asset.fileName : "等待新的媒体结果"}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {!asset ? <p>{emptyDetail}</p> : null}
        {asset?.localUrl && isImage(asset) ? (
          <img
            src={asset.localUrl}
            alt={asset.fileName}
            className="media-preview-card__asset"
          />
        ) : null}
        {asset?.localUrl && isVideo(asset) ? (
          <video
            src={asset.localUrl}
            controls
            playsInline
            preload="metadata"
            className="media-preview-card__asset"
          />
        ) : null}
        {asset ? (
          <p className="media-preview-card__note">
            <IonNote color="medium">
              源：{asset.source}
              {asset.localUrl ? " · 已复制到应用缓存用于预览" : ""}
            </IonNote>
          </p>
        ) : null}
      </IonCardContent>
    </IonCard>
  );
}
