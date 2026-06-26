// Web loading gate shown while RevenueCat/consent state hydrates. The NATIVE
// splash (Capacitor SplashScreen) covers app launch; this is the brief
// in-WebView bridge so there's never a flash of empty UI.
export function SplashGate() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center">
      <div className="flex h-20 w-20 animate-float items-center justify-center rounded-[26px] bg-gradient-amethyst text-3xl text-white shadow-glow">
        ◆
      </div>
      <div className="mt-5 text-lg font-bold tracking-tight text-ink">Geode</div>
      <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 rounded-full bg-amethyst" style={{ animation: 'slide 1s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  );
}
