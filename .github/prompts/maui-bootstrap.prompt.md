---
name: MAUI Template Bootstrap
description: Automatically bootstrap and rebrand the MAUITemplate for a new project, replacing names, splash screens, and Android theme colors.
---

When the user asks to "bootstrap a new MAUI app", "rebrand this MAUI template", or "create a new project from MAUITemplate", perform the following steps:

1. **Rename the Project**
   - Run the `./rename.sh <NewProjectName>` script to replace "MAUITemplate" with the user's requested project name (e.g., `./rename.sh V2ex`).
   - If the script doesn't have execute permissions, run `chmod +x rename.sh` first.

2. **Update Splash Screen and Icons**
   - Navigate to `src/<NewProjectName>.App/Resources/Splash/` and `src/<NewProjectName>.App/Resources/AppIcon/`.
   - Update `splash.svg`, `appicon.svg`, and `appiconfg.svg` to feature the new project name instead of "Starter".
   - Modify the background color block (`<rect width="100%" height="100%" fill="#1E1B4B" />`) if a custom brand color is requested. Otherwise, keep `#1E1B4B` (Deep Blue).

3. **Update `<MauiIcon>` and `<MauiSplashScreen>` in `.csproj`**
   - Open `src/<NewProjectName>.App/<NewProjectName>.App.csproj`.
   - Ensure the `<MauiIcon>` and `<MauiSplashScreen>` tags have `Color="#1E1B4B"` (or the new brand color) and `BaseSize="512,512"`.

4. **Fix Android Immersive Status Bar**
   - Open `src/<NewProjectName>.App/Platforms/Android/Resources/values/styles.xml` and `values-night/styles.xml`.
   - Under `<style name="Template.SplashTheme" parent="Maui.SplashTheme">`, ensure `android:windowLightStatusBar` is `false`, and map `android:statusBarColor` and `android:navigationBarColor` to match the brand color (using `@color/maui_splash_color`).

5. **Deploy and Test**
   - If asked to build, remember that on macOS building a MAUI Android app natively may crash due to `llvm-objcopy`.
   - Add the `-p:UseSharedAssembly=false` MSBuild argument to `dotnet build` or `dotnet run` commands (e.g., `dotnet build -f net10.0-android -p:UseSharedAssembly=false`).
   - Launch on the attached device using `adb install` and `adb shell monkey`.
