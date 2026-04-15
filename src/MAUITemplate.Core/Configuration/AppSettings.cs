namespace MAUITemplate.Core.Configuration;

public sealed record AppSettings(
    string SupportEmail,
    string PrivacyPolicyUrl,
    string TermsOfServiceUrl,
    bool EnableDiagnostics,
    bool EnableFeatureShowcase);
