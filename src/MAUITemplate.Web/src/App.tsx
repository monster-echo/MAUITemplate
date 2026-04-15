import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { createHashHistory } from "history";
import { useEffect } from "react";
import { nativeBridge } from "./bridge/nativeBridge";
import HomeFeaturePage from "./features/home/HomeFeaturePage";
import MessagesFeaturePage from "./features/messages/MessagesFeaturePage";
import NotificationsFeaturePage from "./features/notifications/NotificationsFeaturePage";
import HapticsFeaturePage from "./features/haptics/HapticsFeaturePage";
import PhotosFeaturePage from "./features/photos/PhotosFeaturePage";
import CameraFeaturePage from "./features/camera/CameraFeaturePage";
import VideoFeaturePage from "./features/video/VideoFeaturePage";
import BridgeFeaturePage from "./features/bridge/BridgeFeaturePage";
import BridgeStreamFeaturePage from "./features/bridge/BridgeStreamFeaturePage";
import SettingsFeaturePage from "./features/settings/SettingsFeaturePage";
import PreferencesFeaturePage from "./features/preferences/PreferencesFeaturePage";
import ThemeFeaturePage from "./features/theme/ThemeFeaturePage";
import {
  applyColorMode,
  getStoredMode,
  initColorMode,
  setStoredMode,
  type ColorMode,
} from "./theme/colorMode";
import { createFeatureDefinitions } from "./features/catalog/createFeatureCatalog";
import { useAppStore } from "./store/appStore";
import "./theme/variables.css";

setupIonicReact({
  rippleEffect: true,
  swipeBackEnabled: true,
  hardwareBackButton: true,
  animated: true,
});

const history = createHashHistory();

export default function App({
  initialData,
}: {
  initialData?: { platform?: string };
}) {
  const colorMode = useAppStore((state) => state.colorMode);
  const setColorModeState = useAppStore((state) => state.setColorMode);
  const setPlatformLabel = useAppStore((state) => state.setPlatformLabel);
  const setBridgeReady = useAppStore((state) => state.setBridgeReady);
  const setBridgeCapabilities = useAppStore(
    (state) => state.setBridgeCapabilities,
  );
  const setSystemInfo = useAppStore((state) => state.setSystemInfo);
  const setAppInfo = useAppStore((state) => state.setAppInfo);
  const setPendingNavigation = useAppStore(
    (state) => state.setPendingNavigation,
  );
  const setFeatureDefinitions = useAppStore(
    (state) => state.setFeatureDefinitions,
  );
  const setOffline = useAppStore((state) => state.setOffline);
  const setLastBridgeError = useAppStore((state) => state.setLastBridgeError);
  const setInitializing = useAppStore((state) => state.setInitializing);

  useEffect(() => {
    if (initialData?.platform) {
      (window as any).platform = initialData.platform;
      setPlatformLabel(initialData.platform);
    }
  }, [initialData]);

  useEffect(() => {
    setColorModeState(getStoredMode() ?? initColorMode());
    setFeatureDefinitions(createFeatureDefinitions());

    (window as any).checkWebViewHealth = () => "HEALTHY";

    const bootstrap = async () => {
      try {
        const [capabilities, systemInfo, appInfo] = await Promise.all([
          nativeBridge.getCapabilities(),
          nativeBridge.getSystemInfo(),
          nativeBridge.getAppInfo(),
        ]);

        setBridgeCapabilities(capabilities);
        setSystemInfo(systemInfo);
        setAppInfo(appInfo);
        setBridgeReady(true);
        setLastBridgeError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Failed to bootstrap bridge state", error);
        setLastBridgeError(message);
      } finally {
        setInitializing(false);
      }
    };

    const onNativeMessage = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const raw = customEvent.detail?.message;
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;

        if (!data) {
          return;
        }

        if (data.type === "pushNavigate" && data.route) {
          setPendingNavigation({
            hasPending: true,
            route: data.route,
            payload: typeof data.payload === "string" ? data.payload : null,
          });
          history.push(data.route);
        }
      } catch (error) {
        console.warn("Failed to handle native message", error);
      }
    };

    const loadPendingNavigation = async () => {
      try {
        const pending = await nativeBridge.getPendingNavigation();
        setPendingNavigation(pending);
        if (pending.hasPending && pending.route) {
          history.push(pending.route);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Failed to load pending navigation", error);
        setLastBridgeError(message);
      }
    };

    const updateOnlineStatus = () => {
      setOffline(!navigator.onLine);
    };

    window.addEventListener("HybridWebViewMessageReceived", onNativeMessage);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    bootstrap();
    loadPendingNavigation();
    updateOnlineStatus();

    return () => {
      delete (window as any).checkWebViewHealth;
      window.removeEventListener(
        "HybridWebViewMessageReceived",
        onNativeMessage,
      );
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [
    setAppInfo,
    setBridgeCapabilities,
    setBridgeReady,
    setColorModeState,
    setFeatureDefinitions,
    setInitializing,
    setLastBridgeError,
    setOffline,
    setPendingNavigation,
    setPlatformLabel,
    setSystemInfo,
  ]);

  useEffect(() => {
    (window as any).canGoBack = () => {
      const currentPath = window.location.hash.replace(/^#/, "") || "/";
      return (
        currentPath !== "/home" && currentPath !== "/" && history.length > 1
      );
    };

    return () => {
      delete (window as any).canGoBack;
    };
  }, []);

  const updateColorMode = (mode: ColorMode) => {
    setStoredMode(mode);
    applyColorMode(mode);
    setColorModeState(mode);
  };

  return (
    <IonApp>
      <IonReactRouter history={history}>
        <IonRouterOutlet>
          <Redirect exact from="/" to="/home" />
          <Route
            exact
            path="/home"
            render={(props) => <HomeFeaturePage {...props} />}
          />
          <Route exact path="/messages" component={MessagesFeaturePage} />
          <Route
            exact
            path="/notifications"
            component={NotificationsFeaturePage}
          />
          <Route exact path="/haptics" component={HapticsFeaturePage} />
          <Route exact path="/photos" component={PhotosFeaturePage} />
          <Route exact path="/camera" component={CameraFeaturePage} />
          <Route exact path="/video" component={VideoFeaturePage} />
          <Route exact path="/bridge" component={BridgeFeaturePage} />
          <Route
            exact
            path="/bridge/stream"
            component={BridgeStreamFeaturePage}
          />
          <Route exact path="/preferences" component={PreferencesFeaturePage} />
          <Route
            exact
            path="/theme"
            render={() => (
              <ThemeFeaturePage
                colorMode={colorMode}
                onColorModeChange={updateColorMode}
              />
            )}
          />
          <Route exact path="/settings" component={SettingsFeaturePage} />
          <Route render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
