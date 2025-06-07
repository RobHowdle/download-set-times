// Check if the vendors-data.json file can be accessed via HTTP
// This script should be included directly in the HTML to test file access

document.addEventListener("DOMContentLoaded", function () {
	console.log("Running vendors-data.json access check...");

	// Create a visible status indicator
	const statusDiv = document.createElement("div");
	statusDiv.style.position = "fixed";
	statusDiv.style.bottom = "10px";
	statusDiv.style.right = "10px";
	statusDiv.style.padding = "10px";
	statusDiv.style.background = "rgba(0,0,0,0.8)";
	statusDiv.style.color = "white";
	statusDiv.style.borderRadius = "5px";
	statusDiv.style.zIndex = "9999";
	statusDiv.style.fontSize = "14px";
	statusDiv.style.maxWidth = "300px";
	statusDiv.innerHTML = "Checking vendors-data.json access...";
	document.body.appendChild(statusDiv);

	// Test with different path formats
	const pathsToTry = [
		"vendors-data.json",
		"./vendors-data.json",
		"/vendors-data.json",
		window.location.origin + "/vendors-data.json",
	];

	let successCount = 0;
	let detailedResults = "";

	// Try all paths in sequence
	async function tryAllPaths() {
		for (const path of pathsToTry) {
			try {
				statusDiv.innerHTML = `Trying: ${path}...`;
				const startTime = performance.now();
				const response = await fetch(path);
				const endTime = performance.now();
				const timeElapsed = Math.round(endTime - startTime);

				if (response.ok) {
					successCount++;
					const text = await response.text();
					try {
						JSON.parse(text);
						detailedResults += `✅ ${path}: Success (${timeElapsed}ms) - Valid JSON\n`;
					} catch (e) {
						detailedResults += `⚠️ ${path}: Success (${timeElapsed}ms) - Invalid JSON: ${e.message}\n`;
					}
				} else {
					detailedResults += `❌ ${path}: Failed - ${response.status} ${response.statusText} (${timeElapsed}ms)\n`;
				}
			} catch (error) {
				detailedResults += `❌ ${path}: Error - ${error.message}\n`;
			}
		}

		// Add a simple test for direct XHR
		try {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", "vendors-data.json", true);
			await new Promise((resolve, reject) => {
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						detailedResults += `✅ XHR: Success - ${xhr.status}\n`;
						successCount++;
						resolve();
					} else {
						detailedResults += `❌ XHR: Failed - ${xhr.status}\n`;
						resolve();
					}
				};
				xhr.onerror = () => {
					detailedResults += `❌ XHR: Network Error\n`;
					resolve();
				};
				xhr.send();
			});
		} catch (error) {
			detailedResults += `❌ XHR: Error - ${error.message}\n`;
		}

		// Update status with results
		statusDiv.innerHTML = `${
			successCount > 0 ? "✅" : "❌"
		} File Access: ${successCount}/${pathsToTry.length + 1} successful<br>
                             <button id="toggleDetails" style="padding: 2px 5px; margin-top: 5px;">Show Details</button>
                             <pre id="detailsArea" style="display: none; max-height: 200px; overflow-y: auto;">${detailedResults}</pre>`;

		// Add toggle button functionality
		document
			.getElementById("toggleDetails")
			.addEventListener("click", function () {
				const detailsArea = document.getElementById("detailsArea");
				const isVisible = detailsArea.style.display !== "none";
				detailsArea.style.display = isVisible ? "none" : "block";
				this.textContent = isVisible ? "Show Details" : "Hide Details";
			});

		// Auto-hide after 30 seconds
		setTimeout(() => {
			statusDiv.style.opacity = "0.5";
		}, 30000);
	}

	tryAllPaths();
});
