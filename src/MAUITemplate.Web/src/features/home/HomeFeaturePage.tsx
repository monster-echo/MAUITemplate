import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  cameraOutline,
  chatbubbleEllipsesOutline,
  codeWorkingOutline,
  colorPaletteOutline,
  imageOutline,
  notificationsOutline,
  phonePortraitOutline,
  serverOutline,
  settingsOutline,
  videocamOutline,
} from "ionicons/icons";
import { RouteComponentProps } from "react-router-dom";
import { useAppStore } from "../../store/appStore";

export interface HomeFeaturePageProps extends RouteComponentProps<{}> {}

export default function HomeFeaturePage({ history }: HomeFeaturePageProps) {
  const appInfo = useAppStore((state) => state.appInfo);
  const lastBridgeError = useAppStore((state) => state.lastBridgeError);
  const featureItems = [
    {
      key: "messages",
      label: "消息",
      description: "Toast、Snackbar、消息组合入口。",
      icon: chatbubbleEllipsesOutline,
      route: "/messages",
    },
    {
      key: "notifications",
      label: "通知",
      description: "应用内通知、待处理导航通知演示。",
      icon: notificationsOutline,
      route: "/notifications",
    },
    {
      key: "haptics",
      label: "触动",
      description: "Click / heavy 等原生触感反馈。",
      icon: phonePortraitOutline,
      route: "/haptics",
    },
    {
      key: "photos",
      label: "图片",
      description: "调用系统相册，并直接在 Web 层预览图片。",
      icon: imageOutline,
      route: "/photos",
    },
    {
      key: "camera",
      label: "相机",
      description: "调用系统相机拍照，自动回传并预览。",
      icon: cameraOutline,
      route: "/camera",
    },
    {
      key: "video",
      label: "视频",
      description: "选择或拍摄视频，并返回给 Web 层播放。",
      icon: videocamOutline,
      route: "/video",
    },
    {
      key: "bridge",
      label: "JS 和 C# 交互",
      description: "覆盖 JS 调 C#、C# 回推 JS、文本与二进制示例。",
      icon: codeWorkingOutline,
      route: "/bridge",
    },
    {
      key: "preferences",
      label: "Preferences",
      description: "查看模板已知的原生 Preferences 键和值。",
      icon: serverOutline,
      route: "/preferences",
    },
    {
      key: "theme",
      label: "主题",
      description: "单独管理浅色 / 深色 / 跟随系统。",
      icon: colorPaletteOutline,
      route: "/theme",
    },
    {
      key: "settings",
      label: "设置",
      description: "支持入口、分享、条款与应用信息。",
      icon: settingsOutline,
      route: "/settings",
    },
  ];

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Native Features</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {appInfo?.appName ?? "MAUI Hybrid Starter"}
            </IonCardTitle>
            <IonCardSubtitle>原生能力目录首页</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            {lastBridgeError ? (
              <IonNote
                color="danger"
                style={{ display: "block", marginTop: 12 }}
              >
                最近错误：{lastBridgeError}
              </IonNote>
            ) : null}
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>功能列表</IonLabel>
          </IonListHeader>
          {featureItems.map((item) => (
            <IonItem
              key={item.key}
              button
              detail
              onClick={() => history.push(item.route)}
            >
              <IonIcon slot="start" icon={item.icon} />
              <IonLabel>
                <h2>{item.label}</h2>
                <p>{item.description}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
