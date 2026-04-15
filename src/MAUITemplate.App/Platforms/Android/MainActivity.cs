using Android.App;
using Android.Content.PM;
using Android.OS;
using AndroidX.Core.View;

namespace MAUITemplate.App;

[Activity(Theme = "@style/Template.SplashTheme", MainLauncher = true, LaunchMode = LaunchMode.SingleTop, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);
        ApplySystemBarStyle();
    }

    protected override void OnResume()
    {
        base.OnResume();
        ApplySystemBarStyle();
    }

    public override void OnWindowFocusChanged(bool hasFocus)
    {
        base.OnWindowFocusChanged(hasFocus);

        if (hasFocus)
        {
            ApplySystemBarStyle();
        }
    }

    private void ApplySystemBarStyle()
    {
        if (Window is null)
        {
            return;
        }

        var isDark = global::Microsoft.Maui.Controls.Application.Current?.RequestedTheme == AppTheme.Dark;
        var statusBarColor = Android.Graphics.Color.ParseColor(isDark ? "#121212" : "#f4f4f5");
        var navigationBarColor = Android.Graphics.Color.ParseColor(isDark ? "#121212" : "#ffffff");

        Window.SetStatusBarColor(statusBarColor);
        Window.SetNavigationBarColor(navigationBarColor);

        var controller = WindowCompat.GetInsetsController(Window, Window.DecorView);
        if (controller is null)
        {
            return;
        }

        controller.AppearanceLightStatusBars = !isDark;
        controller.AppearanceLightNavigationBars = !isDark;
    }
}
