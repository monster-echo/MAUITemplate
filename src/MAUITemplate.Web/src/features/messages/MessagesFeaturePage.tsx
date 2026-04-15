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
import { nativeBridge } from "../../bridge/nativeBridge";
import ActionResultCard from "../../components/ActionResultCard";

export default function MessagesFeaturePage() {
  const [resultTitle, setResultTitle] = useState("还没有调用消息能力");
  const [resultDetail, setResultDetail] =
    useState("点下面任意一个入口来触发原生消息。");

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
          <IonTitle>消息</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>消息入口</IonCardTitle>
            <IonCardSubtitle>Toast、Snackbar 与组合反馈</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            这里放各种消息相关的原生入口，方便以后继续扩展更多消息样式。
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>Toast 示例</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("原生 Toast", async () => {
                await nativeBridge.showToastWithDuration(
                  "这是一条来自 C# 的短 Toast 消息",
                  "short",
                );
                return "已触发短 Toast。";
              })
            }
          >
            <IonLabel>
              <h2>短 Toast</h2>
              <p>最轻量的原生消息提示。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("长 Toast", async () => {
                await nativeBridge.showToastWithDuration(
                  "这是一条停留时间更长的 Toast，用来展示更完整的短说明。",
                  "long",
                );
                return "已触发长 Toast。";
              })
            }
          >
            <IonLabel>
              <h2>长 Toast</h2>
              <p>适合更完整的状态提示。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("关闭 Toast", async () => {
                await nativeBridge.dismissToast();
                return "已请求关闭当前 Toast。";
              })
            }
          >
            <IonLabel>
              <h2>关闭当前 Toast</h2>
              <p>用于演示消息取消能力。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>Snackbar 示例</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("短 Snackbar", async () => {
                await nativeBridge.showSnackbarWithOptions(
                  "这是一条短 Snackbar",
                  null,
                  "short",
                );
                return "已触发短 Snackbar。";
              })
            }
          >
            <IonLabel>
              <h2>短 Snackbar</h2>
              <p>更像应用内提醒的消息组件。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("长 Snackbar", async () => {
                await nativeBridge.showSnackbarWithOptions(
                  "这是一条长 Snackbar，适合展示较长说明或引导文案。",
                  null,
                  "long",
                );
                return "已触发长 Snackbar。";
              })
            }
          >
            <IonLabel>
              <h2>长 Snackbar</h2>
              <p>适合更长的通知说明。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("带取消按钮 Snackbar", async () => {
                await nativeBridge.showSnackbarWithOptions(
                  "Snackbar 已展示，右侧有取消按钮。",
                  "取消",
                  "long",
                );
                return "已触发带“取消”按钮的 Snackbar。";
              })
            }
          >
            <IonLabel>
              <h2>带取消按钮 Snackbar</h2>
              <p>演示 action button 的样式与交互。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("常驻 Snackbar", async () => {
                await nativeBridge.showSnackbarWithOptions(
                  "这是一个常驻 Snackbar，请用关闭按钮或下方入口取消。",
                  "关闭",
                  "indefinite",
                );
                return "已触发常驻 Snackbar。";
              })
            }
          >
            <IonLabel>
              <h2>常驻 Snackbar</h2>
              <p>适合用户必须注意到的引导消息。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("关闭 Snackbar", async () => {
                await nativeBridge.dismissSnackbar();
                return "已请求关闭当前 Snackbar。";
              })
            }
          >
            <IonLabel>
              <h2>关闭当前 Snackbar</h2>
              <p>用于演示消息取消能力。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>组合示例</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("Toast + 触感", async () => {
                await nativeBridge.showToastWithDuration(
                  "消息已发送 👋",
                  "short",
                );
                await nativeBridge.haptics("click");
                return "已触发 Toast，并追加 click 触感反馈。";
              })
            }
          >
            <IonLabel>
              <h2>组合消息</h2>
              <p>消息提示 + 轻触感反馈。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <ActionResultCard title={resultTitle} detail={resultDetail} />
      </IonContent>
    </IonPage>
  );
}
