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
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import type { ColorMode } from "../../theme/colorMode";

export interface ThemeFeaturePageProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

export default function ThemeFeaturePage({
  colorMode,
  onColorModeChange,
}: ThemeFeaturePageProps) {
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>主题</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>主题同步</IonCardTitle>
            <IonCardSubtitle>
              单独的主题入口，不再和设置搅成一锅粥。
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              切换这里的模式，会同时更新 Ionic 主题和 MAUI 原生状态栏颜色。
            </IonText>
            <IonSegment
              value={colorMode}
              style={{ marginTop: 16 }}
              onIonChange={(event) => {
                const value = event.detail.value;
                if (value) {
                  onColorModeChange(value as ColorMode);
                }
              }}
            >
              <IonSegmentButton value="light">
                <IonLabel>Light</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="dark">
                <IonLabel>Dark</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="system">
                <IonLabel>System</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
