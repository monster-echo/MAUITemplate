namespace MAUITemplate.App.Models;

public sealed class PendingNavigationState
{
    public bool HasPending { get; set; }
    public string? Route { get; set; }
    public string? Payload { get; set; }
}
