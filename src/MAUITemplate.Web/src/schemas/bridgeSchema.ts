import { z } from "zod";

export const BridgeCapabilitiesSchema = z.object({
  rawMessaging: z.boolean(),
  invokeDotNet: z.boolean(),
  nativeThemeSync: z.boolean(),
  pendingNavigation: z.boolean(),
  preferences: z.boolean(),
  haptics: z.boolean(),
  toast: z.boolean(),
  snackbar: z.boolean(),
  shareText: z.boolean(),
  composeEmail: z.boolean(),
  photoLibrary: z.boolean(),
  camera: z.boolean(),
  videoLibrary: z.boolean(),
  videoCapture: z.boolean(),
  appInfo: z.boolean(),
});

export const NativeMediaAssetSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  fileSizeBytes: z.number(),
  source: z.string(),
  localUrl: z.string().nullable().optional(),
});

export const SystemInfoSchema = z.object({
  platform: z.string(),
  appVersion: z.string(),
  deviceModel: z.string(),
  manufacturer: z.string(),
  deviceName: z.string(),
  operatingSystem: z.string(),
});

export const PlatformInfoSchema = z.object({
  platform: z.string(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const PendingNavigationStateSchema = z.object({
  hasPending: z.boolean(),
  route: z.string().nullable().optional(),
  payload: z.string().nullable().optional(),
});

export const AppInfoSummarySchema = z.object({
  appName: z.string(),
  appVersion: z.string(),
  packageIdentifier: z.string(),
  platform: z.string(),
  supportEmail: z.string(),
  privacyPolicyUrl: z.string(),
  termsOfServiceUrl: z.string(),
});

export const TextInteropResultSchema = z.object({
  source: z.string(),
  message: z.string(),
  length: z.number(),
  receivedAt: z.string(),
});

export const BinaryTransferResultSchema = z.object({
  source: z.string(),
  byteLength: z.number(),
  checksum: z.string(),
  base64: z.string(),
});

export const PreferenceEntrySchema = z.object({
  key: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  exists: z.boolean(),
  value: z.string(),
});

export const PreferenceEntriesSchema = z.array(PreferenceEntrySchema);

export type BridgeCapabilities = z.infer<typeof BridgeCapabilitiesSchema>;
export type NativeMediaAsset = z.infer<typeof NativeMediaAssetSchema>;
export type SystemInfo = z.infer<typeof SystemInfoSchema>;
export type PlatformInfo = z.infer<typeof PlatformInfoSchema>;
export type PendingNavigationState = z.infer<
  typeof PendingNavigationStateSchema
>;
export type AppInfoSummary = z.infer<typeof AppInfoSummarySchema>;
export type TextInteropResult = z.infer<typeof TextInteropResultSchema>;
export type BinaryTransferResult = z.infer<typeof BinaryTransferResultSchema>;
export type PreferenceEntry = z.infer<typeof PreferenceEntrySchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
