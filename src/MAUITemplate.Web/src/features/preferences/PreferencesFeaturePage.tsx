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
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { nativeBridge, type PreferenceEntry } from "../../bridge/nativeBridge";
import ActionResultCard from "../../components/ActionResultCard";

export default function PreferencesFeaturePage() {
  const [entries, setEntries] = useState<PreferenceEntry[]>([]);
  const [resultTitle, setResultTitle] = useState("Preferences 快照");
  const [resultDetail, setResultDetail] = useState(
    "这里会显示最近一次 Preferences 操作结果。",
  );

  const loadEntries = useCallback(async () => {
    try {
      const snapshot = await nativeBridge.getPreferenceEntries();
      setEntries(snapshot);
      setResultTitle("Preferences 快照");
      setResultDetail(`已读取 ${snapshot.length} 个已知 Preferences 键。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle("Preferences 快照");
      setResultDetail(`读取失败：${message}`);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const removeEntry = async (entry: PreferenceEntry) => {
    try {
      await nativeBridge.removeStringValue(entry.key);
      setResultTitle(`已清除 ${entry.title}`);
      setResultDetail(`Key: ${entry.key}`);
      await loadEntries();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResultTitle(`清除 ${entry.title}`);
      setResultDetail(`操作失败：${message}`);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Preferences</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Native Preferences 浏览器</IonCardTitle>
            <IonCardSubtitle>展示模板当前已知的原生键值缓存。</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              由于 MAUI Preferences
              不支持全量枚举，这里展示的是模板当前使用到的已知 key。
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader>
            <IonLabel>操作</IonLabel>
          </IonListHeader>
          <IonItem button detail onClick={() => void loadEntries()}>
            <IonLabel>
              <h2>刷新 Preferences 快照</h2>
              <p>重新从原生 Preferences 拉取当前已知键值。</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>已知 Preferences</IonLabel>
          </IonListHeader>
          {entries.map((entry) => (
            <IonItem key={entry.key}>
              <IonLabel>
                <h2>{entry.title}</h2>
                <p>{entry.description}</p>
                <p>
                  <strong>{entry.key}</strong>
                </p>
                <p>分类：{entry.category}</p>
                <p>
                  状态：
                  <IonBadge color={entry.exists ? "success" : "medium"}>
                    {entry.exists ? "已写入" : "未写入"}
                  </IonBadge>
                </p>
                <p>
                  值：{entry.exists ? entry.value || "(空字符串)" : "(暂无值)"}
                </p>
              </IonLabel>
              <IonButtons slot="end">
                <IonButton
                  color="medium"
                  fill="outline"
                  onClick={() => void removeEntry(entry)}
                >
                  清除
                </IonButton>
              </IonButtons>
            </IonItem>
          ))}
        </IonList>

        <ActionResultCard
          title={resultTitle}
          detail={resultDetail}
          note="清除操作只会移除单个 key，不会影响 localStorage 中的 Web 侧状态。"
        />
      </IonContent>
    </IonPage>
  );
}
