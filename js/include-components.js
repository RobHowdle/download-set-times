/**
 * Simple component include system
 * This script loads HTML components into designated placeholders
 */

document.addEventListener("DOMContentLoaded", function () {
	// Find all elements with data-include attribute
	const includes = document.querySelectorAll("[data-include]");

	// Process each include
	includes.forEach((element) => {
		const file = element.getAttribute("data-include");

		// Fetch the component file
		fetch(file)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to load component: ${file}`);
				}
				return response.text();
			})
			.then((html) => {
				// Insert the component's HTML into the placeholder
				element.innerHTML = html;

				// Initialize sidebar functionality if this is the sidebar component
				if (file.includes("sidebar-menu")) {
					initSidebarDecorations && initSidebarDecorations();
					// Dynamically import and initialize sidebar-menu.js
					import("./sidebar-menu.js").then((mod) => {
						if (mod && typeof mod.initSidebarMenu === "function") {
							mod.initSidebarMenu();
						}
					});
				}

				// Dispatch an event when the component is loaded
				const event = new CustomEvent("component-loaded", {
					bubbles: true,
					detail: {component: file},
				});
				element.dispatchEvent(event);

				// Once all components are loaded, initialize the sidebar toggle
				if (
					document.querySelectorAll("[data-include]").length ===
					document.querySelectorAll(".component-loaded").length + 1
				) {
					element.classList.add("component-loaded");
					initSidebarToggle();
				} else {
					element.classList.add("component-loaded");
				}
			})
			.catch((error) => {
				console.error(error);
				element.innerHTML = `<div class="component-error">Error loading component</div>`;
			});
	});
});

/**
 * Initialize the sidebar toggle functionality
 */
function initSidebarToggle() {
	const toggleBtn = document.getElementById("sidebarToggle");
	const sidebar = document.getElementById("sidebarMenu");
	const overlay = document.getElementById("sidebarOverlay");

	if (!toggleBtn || !sidebar) return;

	// Set initial state - sidebar closed by default
	document.body.classList.add("sidebar-closed");

	// Toggle sidebar when button is clicked
	toggleBtn.addEventListener("click", () => {
		document.body.classList.toggle("sidebar-closed");
		toggleBtn.classList.toggle("active");

		// Update aria-expanded state for accessibility
		const isOpen = !document.body.classList.contains("sidebar-closed");
		toggleBtn.setAttribute("aria-expanded", isOpen.toString());

		if (overlay) {
			if (document.body.classList.contains("sidebar-closed")) {
				overlay.style.opacity = "0";
				setTimeout(() => {
					overlay.style.display = "none";
				}, 300);
			} else {
				overlay.style.display = "block";
				setTimeout(() => {
					overlay.style.opacity = "1";
				}, 10);
			}
		}
	});

	// Close sidebar when clicking overlay
	if (overlay) {
		overlay.addEventListener("click", () => {
			document.body.classList.add("sidebar-closed");
			toggleBtn.classList.remove("active");
			toggleBtn.setAttribute("aria-expanded", "false");
			overlay.style.opacity = "0";
			setTimeout(() => {
				overlay.style.display = "none";
			}, 300);
		});
	}
}

/**
 * Add decorative elements to the sidebar
 */
function initSidebarDecorations() {
	const menuHeader = document.querySelector(".menu-header");
	if (menuHeader) {
		// Create decorative elements
		const decorativeElements = document.createElement("div");
		decorativeElements.className = "decorative-elements";

		// Add random dots for subtle background texture
		for (let i = 0; i < 20; i++) {
			const dot = document.createElement("div");
			dot.className = "decorative-dot";
			dot.style.top = `${Math.random() * 100}%`;
			dot.style.left = `${Math.random() * 100}%`;
			dot.style.opacity = (Math.random() * 0.6 + 0.2).toString();
			decorativeElements.appendChild(dot);
		}

		menuHeader.appendChild(decorativeElements);
	}
}
