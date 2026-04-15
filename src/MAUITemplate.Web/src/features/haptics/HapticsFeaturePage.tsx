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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function HapticsFeaturePage() {
  const [resultTitle, setResultTitle] = useState("还没有触发触感反馈");
  const [resultDetail, setResultDetail] =
    useState("这里可以测试不同的原生触感反馈。");

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
          <IonTitle>触动</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>触感反馈</IonCardTitle>
            <IonCardSubtitle>click / heavy 等交互反馈</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            适合拿来做按钮确认、长按反馈和一些关键操作的微交互。
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>基础触感</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("Click 触感", async () => {
                await nativeBridge.haptics("click");
                return "已触发 click 级别触感反馈。";
              })
            }
          >
            <IonLabel>
              <h2>Click</h2>
              <p>轻量点击反馈。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("Heavy 触感", async () => {
                await nativeBridge.haptics("heavy");
                return "已触发 heavy 级别触感反馈。";
              })
            }
          >
            <IonLabel>
              <h2>Heavy / LongPress</h2>
              <p>更明显、更适合确认型操作。</p>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel>组合触感</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("双击节奏", async () => {
                await nativeBridge.haptics("click");
                await sleep(120);
                await nativeBridge.haptics("click");
                return "已触发双击节奏：click → click。";
              })
            }
          >
            <IonLabel>
              <h2>双击节奏</h2>
              <p>适合连续确认操作的微交互。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("重击后轻击", async () => {
                await nativeBridge.haptics("heavy");
                await sleep(160);
                await nativeBridge.haptics("click");
                return "已触发 heavy → click 的组合触感。";
              })
            }
          >
            <IonLabel>
              <h2>重击后轻击</h2>
              <p>适合强调“确认完成”的感觉。</p>
            </IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            onClick={() =>
              void runAction("触感 + Toast", async () => {
                await nativeBridge.haptics("heavy");
                await nativeBridge.showToastWithDuration(
                  "触感反馈已完成",
                  "short",
                );
                return "已触发 heavy 触感，并显示一个 Toast。";
              })
            }
          >
            <IonLabel>
              <h2>触感 + Toast</h2>
              <p>常见于提交成功、操作完成等场景。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <ActionResultCard title={resultTitle} detail={resultDetail} />
      </IonContent>
    </IonPage>
  );
}
