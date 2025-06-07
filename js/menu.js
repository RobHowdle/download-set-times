/**
 * Menu Module
 * Handles side menu functionality
 */
document.addEventListener("DOMContentLoaded", function () {
	// Wait for a short time to ensure elements are loaded
	setTimeout(initializeMenu, 100);

	// Also listen for navigation loaded event
	document.addEventListener("navigationLoaded", initializeMenu);

	// Re-initialize after dynamic content loads
	document.addEventListener("contentLoaded", initializeMenu);
});

/**
 * Initialize the side menu functionality
 */
function initializeMenu() {
	console.log("Initializing menu...");

	// Get menu elements
	const menuBtn = document.getElementById("menu-toggle-btn");
	const menuBtnMobile = document.getElementById("menu-toggle-btn-mobile");
	const menuBtnDesktop = document.getElementById("menu-toggle-btn-desktop");
	const closeBtn = document.getElementById("menu-close-btn");
	const overlay = document.getElementById("menu-overlay");
	const sideMenu = document.getElementById("side-menu");
	const menuFavorites = document.getElementById("menu-favorites");
	const menuPosterGenerate = document.getElementById("menu-poster-generate");
	const menuTimetableGenerate = document.getElementById(
		"menu-timetable-generate"
	);
	const menuMapBtn = document.getElementById("menu-map-btn");

	// Check if we're on the index page
	const isIndexPage =
		window.location.pathname.includes("index.html") ||
		window.location.pathname.endsWith("/") ||
		window.location.pathname.endsWith("/download-set-times/");

	// Show/hide index-only elements
	const indexOnlyElements = document.querySelectorAll(".index-only");
	indexOnlyElements.forEach((element) => {
		if (isIndexPage) {
			element.style.display = "";
		} else {
			element.style.display = "none";
		}
	});

	// Toggle menu visibility
	function openMenu(e) {
		e.preventDefault();
		console.log("Opening menu");
		if (overlay && sideMenu) {
			overlay.classList.add("active");
			sideMenu.classList.add("active");
			document.body.style.overflow = "hidden"; // Prevent scrolling
		} else {
			console.error(
				"Menu elements not found: overlay or sideMenu missing"
			);
		}
	}

	// Attach click events to menu buttons
	if (menuBtn) {
		console.log("Attaching event to main menu button");
		menuBtn.addEventListener("click", openMenu);
	}

	if (menuBtnMobile) {
		console.log("Attaching event to mobile menu button");
		menuBtnMobile.addEventListener("click", openMenu);
	}

	if (menuBtnDesktop) {
		console.log("Attaching event to desktop menu button");
		menuBtnDesktop.addEventListener("click", openMenu);
	} else {
		console.warn("Desktop menu button not found");
	}

	// Close menu
	function closeMenu(e) {
		if (e) e.preventDefault();
		console.log("Closing menu");
		if (overlay && sideMenu) {
			overlay.classList.remove("active");
			sideMenu.classList.remove("active");
			document.body.style.overflow = ""; // Restore scrolling
		}
	}

	if (closeBtn) {
		console.log("Attaching event to close button");
		closeBtn.addEventListener("click", closeMenu);
	} else {
		console.warn("Close button not found");
	}

	if (overlay) {
		overlay.addEventListener("click", closeMenu);
	} else {
		console.warn("Overlay element not found");
	}

	// Handle menu item clicks
	if (menuFavorites) {
		menuFavorites.addEventListener("click", function () {
			// Call the showFavoritesModal function
			if (typeof window.showFavoritesModal === "function") {
				window.showFavoritesModal();
			}
			closeMenu();
		});
	}

	if (menuPosterGenerate) {
		menuPosterGenerate.addEventListener("click", function () {
			// Call the generate poster function
			if (typeof window.generatePersonalizedPoster === "function") {
				window.generatePersonalizedPoster();
			}
			closeMenu();
		});
	}

	if (menuTimetableGenerate) {
		menuTimetableGenerate.addEventListener("click", function () {
			// Call the generate timetable function
			if (typeof window.showDaySelectionModal === "function") {
				window.showDaySelectionModal();
			}
			closeMenu();
		});
	}

	if (menuMapBtn) {
		menuMapBtn.addEventListener("click", function () {
			// Navigate to the dedicated map page in the same tab
			window.location.href = "map.html";
			closeMenu();
		});
	}
}
