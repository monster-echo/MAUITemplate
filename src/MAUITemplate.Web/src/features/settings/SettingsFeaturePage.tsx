import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { nativeBridge } from "../../bridge/nativeBridge";
import { useAppStore } from "../../store/appStore";
import "../../pages/pageStyles.css";
export default function SettingsFeaturePage() {
  const appInfo = useAppStore((state) => state.appInfo);

  const shareApp = async () => {
    try {
      await nativeBridge.shareText(
        appInfo?.appName ?? "MAUI Hybrid Starter",
        `Check out ${appInfo?.appName ?? "MAUI Hybrid Starter"} — a reusable MAUI + Ionic starter.`,
      );
    } catch (error) {
      console.warn("Failed to share app", error);
    }
  };

  const contactSupport = async () => {
    try {
      await nativeBridge.composeSupportEmail(
        "Starter feedback",
        "Hi team, I want to discuss improving the starter.",
        appInfo?.supportEmail,
      );
    } catch (error) {
      console.warn("Failed to compose support email", error);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-stack">
          <IonCard>
            <IonCardContent>
              <h2 className="page-title">Support & sharing</h2>
              <IonText color="medium">
                设置页现在只放真正的设置项：分享、支持和必要的应用信息。
              </IonText>
              <IonButton
                expand="block"
                className="button-spacing"
                onClick={shareApp}
              >
                Share this starter
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                className="button-spacing"
                onClick={contactSupport}
              >
                Contact support
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardContent>
              <h2 className="page-title">Store-ready links</h2>
              <IonText color="medium">
                这些入口很适合放在未来所有 App 的 About / Settings 页面里。
              </IonText>
              <IonButton
                expand="block"
                fill="outline"
                className="button-spacing"
                onClick={() =>
                  nativeBridge.openExternalLink(
                    appInfo?.privacyPolicyUrl ?? "https://example.com/privacy",
                  )
                }
              >
                Privacy policy
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                className="button-spacing"
                onClick={() =>
                  nativeBridge.openExternalLink(
                    appInfo?.termsOfServiceUrl ?? "https://example.com/terms",
                  )
                }
              >
                Terms of service
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardContent>
              <h2 className="page-title">App info</h2>
              <IonList inset>
                {appInfo ? (
                  <>
                    <IonItem>
                      <IonLabel>
                        <strong>appName</strong>
                        <p>{appInfo.appName}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <strong>version</strong>
                        <p>{appInfo.appVersion}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <strong>packageIdentifier</strong>
                        <p>{appInfo.packageIdentifier}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <strong>platform</strong>
                        <p>{appInfo.platform}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <strong>supportEmail</strong>
                        <p>{appInfo.supportEmail}</p>
                      </IonLabel>
                    </IonItem>
                  </>
                ) : (
                  <IonItem>
                    <IonLabel>App info unavailable.</IonLabel>
                  </IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
}
