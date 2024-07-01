document.addEventListener('DOMContentLoaded', async () => {
  const usageDiv = document.getElementById('usage');

  async function updateUsage() {
    usageDiv.innerHTML = ''; // Clear previous content

    const data = await chrome.storage.local.get('tabUsage');
    const tabUsage = data.tabUsage || {};

    if (Object.keys(tabUsage).length === 0) {
      usageDiv.textContent = 'No websites tracked.';
    } else {
      for (const domain in tabUsage) {
        const { timeSpent } = tabUsage[domain];
        const timeInSeconds = timeSpent / 1000; // Convert ms to seconds
        const timeInMinutes = timeInSeconds / 60; // Convert seconds to minutes

        const p = document.createElement('p');
        if (timeInMinutes < 1) {
          p.textContent = `${domain}: ${timeInSeconds.toFixed(2)} seconds`;
        } else {
          p.textContent = `${domain}: ${timeInMinutes.toFixed(2)} minutes`;
        }
        usageDiv.appendChild(p);
      }
    }
  }

  // Initial load
  updateUsage();

  // Update every second
  setInterval(updateUsage, 1000);
});
