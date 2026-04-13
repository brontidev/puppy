<script lang="ts">
  import { onMount } from "svelte";

  let showUpdatePrompt = $state(false);

  onMount(() => {
    // Listen for service worker updates
    if ("serviceWorker" in navigator) {
      let hasUpdated = false;

      const checkForUpdates = async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Check for updates every 30 seconds
          setInterval(() => {
            registration.update();
          }, 30000);

          // Listen for new service worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New SW installed and there's an old one, show prompt
                  hasUpdated = true;
                  showUpdatePrompt = true;
                }
              });
            }
          });
        }
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkForUpdates);
      } else {
        checkForUpdates();
      }
    }
  });

  const handleReload = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    showUpdatePrompt = false;
  };
</script>

{#if showUpdatePrompt}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="alert"
  >
    <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
      <h2 class="mb-2 text-2xl font-bold">Update Available</h2>
      <p class="mb-6 text-gray-600">
        A new version of Puppy is available. Reload to get the latest features!
      </p>
      <div class="flex gap-3">
        <button
          class="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
          onclick={handleDismiss}
        >
          Later
        </button>
        <button
          class="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          onclick={handleReload}
        >
          Reload
        </button>
      </div>
    </div>
  </div>
{/if}
