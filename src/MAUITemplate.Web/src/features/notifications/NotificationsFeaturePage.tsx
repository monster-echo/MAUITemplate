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

export default function NotificationsFeaturePage() {
  const [resultTitle, setResultTitle] = useState("还没有触发通知入口");
  const [resultDetail, setResultDetail] = useState(
    "当前模板先提供应用内通知与待处理导航通知示例。",
  );

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
          <IonTitle>通知</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>通知入口</IonCardTitle>
            <IonCardSubtitle>应用内通知与待处理导航示例</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            目前模板里先放常见的应用内通知链路，后续你可以在这里继续挂本地通知或推送通知能力。
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>通知展示</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("应用内通知", async () => {
                await nativeBridge.showSnackbarWithOptions(
                  "这是一个应用内通知提醒",
                  null,
                  "short",
                );
                return "已触发应用内通知（Snackbar）。";
              })
            }
          >
            <IonLabel>
              <h2>应用内通知</h2>
              <p>使用 Snackbar 作为轻量通知反馈。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("高优先级通知", async () => {
                await nativeBridge.haptics("heavy");
                await nativeBridge.showSnackbarWithOptions(
                  "高优先级通知：需要你的注意。",
                  "知道了",
                  "long",
                );
                return "已触发高优先级通知：heavy 触感 + 长 Snackbar。";
              })
            }
          >
            <IonLabel>
              <h2>高优先级通知</h2>
              <p>触感反馈 + 带按钮的较长通知。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>通知跳转示例</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("写入通知导航", async () => {
                await nativeBridge.setPendingNavigation(
                  "/bridge",
                  JSON.stringify({ source: "notification-demo" }),
                );
                return "已把桥接页写入待处理导航，可模拟通知点击后的跳转。";
              })
            }
          >
            <IonLabel>
              <h2>写入待处理导航</h2>
              <p>模拟通知点击后跳转到桥接页。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("写入消息页通知导航", async () => {
                await nativeBridge.setPendingNavigation(
                  "/messages",
                  JSON.stringify({
                    source: "notification-demo",
                    type: "messages",
                  }),
                );
                return "已把消息页写入待处理导航。";
              })
            }
          >
            <IonLabel>
              <h2>写入消息页导航</h2>
              <p>模拟点击通知后跳转到消息页。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("读取待处理导航", async () => {
                const pending = await nativeBridge.getPendingNavigation();
                return JSON.stringify(pending, null, 2);
              })
            }
          >
            <IonLabel>
              <h2>读取待处理导航</h2>
              <p>读取后会消费并清除当前待处理导航。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("清除通知导航", async () => {
                await nativeBridge.clearPendingNavigation();
                return "已清空待处理导航。";
              })
            }
          >
            <IonLabel>
              <h2>清除待处理导航</h2>
              <p>重置通知相关的导航状态。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <ActionResultCard title={resultTitle} detail={resultDetail} />
      </IonContent>
    </IonPage>
  );
}
