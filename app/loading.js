import Logo from "./components/Logo";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-12" />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-steel-300 border-t-copper-500" />
        <div className="text-center">
          <p className="font-heading text-lg text-ink-950">Loading IndusLink</p>
          <p className="mt-1 text-sm text-ink-700">Getting verified machines ready…</p>
        </div>
      </div>
    </div>
  );
}

