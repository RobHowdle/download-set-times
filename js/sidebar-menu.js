// js/sidebar-menu.js
// This script should be loaded after the sidebar-menu.html is inserted into the DOM.

export function initSidebarMenu() {
	console.log("[Sidebar] sidebar-menu.js loaded");

	// Get current page filename
	const currentPath = window.location.pathname;
	const currentPage =
		currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";

	// Find all menu items that are links
	const menuLinks = document.querySelectorAll(".menu-item[href]");

	// Remove any existing active classes from all menu items
	document.querySelectorAll(".menu-item").forEach((item) => {
		item.classList.remove("active");
	});

	// Set active class based on current page
	menuLinks.forEach((item) => {
		const href = item.getAttribute("href");
		if (
			href === currentPage ||
			(currentPage === "" && href === "index.html") ||
			(currentPage === "/" && href === "index.html")
		) {
			item.classList.add("active");
		}
	});

	// Toggle visibility of index-only items
	const indexOnly = document.querySelectorAll(".index-only");
	const isIndexPage =
		currentPage === "index.html" ||
		currentPage === "" ||
		currentPage === "/";

	indexOnly.forEach((item) => {
		item.style.display = isIndexPage ? "flex" : "none";
	});

	// Utility: Auto-close sidebar after any sidebar button click (mobile/responsive)
	function autoCloseSidebar() {
		if (document.body.classList.contains("sidebar-closed")) return; // Prevent duplicate close
		document.body.classList.add("sidebar-closed");
		document.body.classList.remove("sidebar-open");
		const sidebar = document.getElementById("sidebarMenu");
		if (sidebar) sidebar.classList.remove("open");
		const overlay = document.getElementById("sidebarOverlay");
		if (overlay) overlay.classList.remove("show");
		// --- Fix: Reset sidebar toggle button icon to hamburger ---
		const toggleBtn = document.getElementById("sidebarToggle");
		if (toggleBtn) {
			toggleBtn.classList.remove("active");
			toggleBtn.setAttribute("aria-expanded", "false");
		}
	}

	// Add event listeners for special buttons - only do this on the index page
	if (isIndexPage) {
		// Handle Wallpaper Generator button
		const wallpaperBtn = document.getElementById("menu-timetable-generate");
		if (wallpaperBtn) {
			wallpaperBtn.addEventListener("click", function (e) {
				console.log("[Sidebar] Wallpaper Generator button clicked");
				autoCloseSidebar();
				document.dispatchEvent(new CustomEvent("generateWallpaper"));
			});
		}

		// Handle Poster Generator button
		const posterBtn = document.getElementById("menu-poster-generate");
		if (posterBtn) {
			posterBtn.addEventListener("click", function (e) {
				console.log("[Sidebar] Poster Generator button clicked");
				autoCloseSidebar();
				document.dispatchEvent(new CustomEvent("generatePoster"));
			});
		}

		// Handle My Artists button
		const favoritesBtn = document.getElementById("menu-favorites");
		if (favoritesBtn) {
			favoritesBtn.addEventListener("click", function () {
				console.log("[Sidebar] My Artists button clicked");
				autoCloseSidebar();
				document.dispatchEvent(new CustomEvent("openFavoritesModal"));
			});
		}
	}

	// Make absolutely sure the active class is set - this runs after all other code
	window.setTimeout(function () {
		menuLinks.forEach((item) => {
			const href = item.getAttribute("href");
			if (
				href === currentPage ||
				(currentPage === "" && href === "index.html") ||
				(currentPage === "/" && href === "index.html")
			) {
				item.classList.add("active");
			}
		});
	}, 500);

	// --- ENSURE: Always close sidebar and set z-index before showing modals ---
	function forceCloseSidebarForModal() {
		if (document.body.classList.contains("sidebar-closed")) return; // Prevent duplicate close
		document.body.classList.add("sidebar-closed");
		document.body.classList.remove("sidebar-open");
		const sidebar = document.getElementById("sidebarMenu");
		if (sidebar) {
			sidebar.classList.remove("open");
			sidebar.style.zIndex = "10"; // Lower than modal z-index
		}
		const overlay = document.getElementById("sidebarOverlay");
		if (overlay) overlay.classList.remove("show");
		// --- Fix: Reset sidebar toggle button icon to hamburger ---
		const toggleBtn = document.getElementById("sidebarToggle");
		if (toggleBtn) {
			toggleBtn.classList.remove("active");
			toggleBtn.setAttribute("aria-expanded", "false");
		}
	}

	["openFavoritesModal", "generateWallpaper", "generatePoster"].forEach(
		function (eventName) {
			document.addEventListener(eventName, forceCloseSidebarForModal);
		}
	);

	// Restore sidebar z-index when sidebar is opened
	const sidebar = document.getElementById("sidebarMenu");
	const overlay = document.getElementById("sidebarOverlay");
	function restoreSidebarZ() {
		if (sidebar) sidebar.style.zIndex = "";
	}
	if (sidebar) {
		sidebar.addEventListener("transitionend", restoreSidebarZ);
		sidebar.addEventListener("animationend", restoreSidebarZ);
	}
	if (overlay) {
		overlay.addEventListener("click", restoreSidebarZ);
	}
}

// Optionally, auto-initialize if sidebar is already present
if (document.getElementById("sidebarMenu")) {
	initSidebarMenu();
}
