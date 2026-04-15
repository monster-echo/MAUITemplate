using MAUITemplate.Core;
using MAUITemplate.Core.Diagnostics;

namespace MAUITemplate.App.Services.Bridge;

public sealed partial class AppBridge
{
    public Task<string> GetPlatformInfoAsync()
    {
        return ExecuteSafeAsync(() => Task.FromResult(new
        {
            platform = DeviceInfo.Platform.ToString() switch
            {
                "Android" => "android",
                "iOS" => "ios",
                "MacCatalyst" => "maccatalyst",
                "WinUI" => "windows",
                _ => "unknown",
            }
        }));
    }

    public Task<string> GetBridgeCapabilitiesAsync()
    {
        return ExecuteSafeAsync(() => Task.FromResult(new
        {
            rawMessaging = true,
            invokeDotNet = true,
            nativeThemeSync = true,
            pendingNavigation = true,
            preferences = true,
            haptics = true,
            toast = true,
            snackbar = true,
            shareText = true,
            composeEmail = true,
            photoLibrary = true,
            camera = MediaPicker.Default.IsCaptureSupported,
            videoLibrary = true,
            videoCapture = MediaPicker.Default.IsCaptureSupported,
            appInfo = true,
        }));
    }

    public Task<string> GetAppInfoSummaryAsync()
    {
        return ExecuteSafeAsync(() => Task.FromResult(new AppInfoSummary(
            AppInfo.Current.Name,
            AppInfo.Current.VersionString,
            AppInfo.Current.PackageName,
            DeviceInfo.Platform.ToString(),
            _appSettings.SupportEmail,
            _appSettings.PrivacyPolicyUrl,
            _appSettings.TermsOfServiceUrl)));
    }

}