namespace MAUITemplate.App;

public partial class App : Application
{
	private readonly AppShell _appShell;

	public static event Action? AppResumed;
	public static event Action? AppSlept;
	public static DateTimeOffset? LastSleepTime { get; private set; }

	public App(AppShell appShell)
	{
		InitializeComponent();
		_appShell = appShell;
	}

	protected override void OnSleep()
	{
		LastSleepTime = DateTimeOffset.UtcNow;
		AppSlept?.Invoke();
		base.OnSleep();
	}

	protected override void OnResume()
	{
		AppResumed?.Invoke();
		base.OnResume();
	}

	protected override Window CreateWindow(IActivationState? activationState)
	{
		return new Window(_appShell);
	}
}