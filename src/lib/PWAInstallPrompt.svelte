<script lang="ts">
  import { onMount } from "svelte";

  let isStandalone = $state(false);
  let showInstallPrompt = $state(false);
  let isIOS = $state(false);
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  const detectIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  onMount(() => {
    isIOS = detectIOS();

    // Check if app is running as PWA
    const isRunningAsApp =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    isStandalone = isRunningAsApp;

    // Listen for install prompt (Chrome, Edge, etc.)
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e as any;
      if (!isRunningAsApp) {
        showInstallPrompt = true;
      }
    });

    // Hide prompt when installed
    window.addEventListener("appinstalled", () => {
      showInstallPrompt = false;
      deferredPrompt = null;
    });

    // If not running as standalone, show prompt
    if (!isRunningAsApp) {
      showInstallPrompt = true;
    }
  });

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        deferredPrompt = null;
      }
    }
  };

  const handleDismiss = () => {
    showInstallPrompt = false;
  };
</script>

{#if showInstallPrompt && !isStandalone}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="alert"
  >
    <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
      {#if isIOS}
        <h2 class="mb-2 text-2xl font-bold">Install Puppy</h2>
        <p class="mb-4 text-gray-600">
          This app works best as an installed PWA. Here's how to install on iOS:
        </p>
        <ol class="mb-6 space-y-2 pl-5 text-sm text-gray-700">
          <li class="list-decimal">
            Tap the<span class="font-semibold"> Share</span>
            button at the bottom of Safari
          </li>
          <li class="list-decimal">
            Scroll and tap<span class="font-semibold"> Add to Home Screen</span>
          </li>
          <li class="list-decimal">
            and tap<span class="font-semibold"> Add</span>
          </li>
        </ol>
        <button
          class="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          onclick={handleDismiss}
        >
          Got it
        </button>
      {:else}
        <h2 class="mb-2 text-2xl font-bold">Install Puppy</h2>
        <p class="mb-6 text-gray-600">
          This app must be installed as a Progressive Web App to use it.
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
            onclick={handleInstall}
          >
            Install
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}