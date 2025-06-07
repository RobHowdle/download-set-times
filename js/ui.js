/**
 * Set up hover/click events for schedule blocks
 * @param {HTMLElement} block - The schedule block element
 * @param {Object} set - The event/artist set data
 * @param {string} stage - The stage name
 * @param {string} day - The day name
 * @param {string} venue - The venue name
 */
export function setupBlockHoverEvents(block, set, stage, day, venue) {
	// Check if device is touch-capable
	const isTouchDevice =
		"ontouchstart" in window || navigator.maxTouchPoints > 0;
	let touchStartX = 0;
	let touchStartY = 0;
	let isTap = true; // Assume it's a tap until proven otherwise (by significant movement)

	if (isTouchDevice) {
		// Mobile device - use touch events with proper handling
		block.addEventListener(
			"touchstart",
			(event) => {
				// Only consider the first touch for a single tap
				if (event.touches.length === 1) {
					touchStartX = event.touches[0].clientX;
					touchStartY = event.touches[0].clientY;
					isTap = true; // Reset for each touchstart
				}
			},
			{passive: true} // Use passive for touchstart to improve scrolling performance
		);

		block.addEventListener(
			"touchmove",
			(event) => {
				// If there's significant movement, it's a scroll, not a tap
				const moveX = event.touches[0].clientX;
				const moveY = event.touches[0].clientY;
				const deltaX = Math.abs(moveX - touchStartX);
				const deltaY = Math.abs(moveY - touchStartY);

				// Define a small threshold for movement
				const moveThreshold = 10;

				if (deltaX > moveThreshold || deltaY > moveThreshold) {
					isTap = false; // It's a scroll
				}
			},
			{passive: true} // Use passive for touchmove
		);

		block.addEventListener(
			"touchend",
			(event) => {
				// Check if it was a tap and not a scroll or a cancelled touch
				if (isTap && event.changedTouches.length === 1) {
					// Prevent default only if we are actually showing the modal
					// This ensures scrolling isn't blocked if it was indeed a scroll
					event.preventDefault();
					showEventDetails(event, set, stage, day, venue, true);
				}
				isTap = false; // Reset for next interaction
			},
			{passive: false} // touchend needs to be non-passive if you might prevent default
		);
	} else {
		// Desktop device - use mouse events for hover and click
		block.addEventListener("mouseenter", (e) => {
			showEventDetails(e, set, stage, day, venue, false);
		});

		block.addEventListener("mouseleave", () => {
			hideEventDetails();
		});

		// Ensure that clicking also triggers the details for consistency
		block.addEventListener("click", (e) => {
			showEventDetails(e, set, stage, day, venue, false);
		});
	}
}

// Helper to display people for a set (needed for createArtistRow and createEventBlock)
function getPeopleForSetDisplay(setKey) {
	// For now, this simply returns "You" if it's a favorite,
	// but it's set up to be expanded for multiple people.
	if (state.favoriteSets.some((fav) => fav.setKey === setKey)) {
		return [getCurrentPersonName()];
	}
	return [];
}

// Make functions globally accessible if needed for inline event handlers
window.filterStage = filterStage;
window.showDay = showDayPatched;
window.showDistrictXDay = showDistrictXDay;
window.filterDistrictXStage = filterDistrictXStage;
window.toggleFavoriteSet = function (setKey, heartSvgElement) {
	const idx = state.favoriteSets.findIndex(
		(fav) => fav.setKey === setKey && fav.person === "You"
	);
	let isFavorite;

	if (idx === -1) {
		state.favoriteSets.push({setKey, person: "You"});
		isFavorite = true;
	} else {
		state.favoriteSets.splice(idx, 1);
		isFavorite = false;
	}
	saveFavorites();

	// Update heart icon visually
	if (heartSvgElement) {
		heartSvgElement.setAttribute("fill", isFavorite ? "#06b6d4" : "none");
		heartSvgElement.setAttribute(
			"stroke",
			isFavorite ? "none" : "currentColor"
		);
	}

	// Re-render relevant parts of the UI
	// This will depend on the current view (Arena or District X) and day
	const currentVenue = document.getElementById("arena-schedule-tab").classList.contains("active-tab") ? "arena" : "districtX";
	const currentDay = currentVenue === "arena" ? state.currentDay : state.districtXCurrentDay;

	if (currentVenue === "arena") {
		showDayPatched(currentDay);
	} else {
		showDistrictXDay(currentDay);
	}

	// If favorites modal is open, update it
	if (document.getElementById("favorites-modal") && !document.getElementById("favorites-modal").classList.contains("hidden")) {
		showFavoritesModalWithActiveDay(currentDay);
	}
};

// Initial setup when the DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
	await initState(); // Load initial state and data
	setupEventListeners(); // Setup global event listeners
	// Set default view mode if not set
	if (!getViewMode()) {
		setViewMode("timeline");
	}
	// Initial render based on the current day in state (defaults to friday)
	showDayPatched(state.currentDay || "friday");
	setCurrentPersonId(); // Ensure current person is set for the "You" favorite
});

// Expose internal functions for testing or global access if needed
export {
	getSetKey,
	getPeopleForSet,
	getColorForPerson,
	getCurrentPerson,
	setCurrentPersonId,
	setCurrentPersonName,
	getCurrentPersonName,
	getPeopleForSetDisplay,
	showEventDetails,
	hideEventDetails,
	checkForSetConflict,
	updateDaySelection,
	renderStageRow,
	createEventBlock,
	stylizeBlock,
	showComingSoonMessage,
	renderDistrictXSchedule,
	renderDistrictXListView,
	createTimeHeaderRow,
	renderDistrictXStageButtons,
	// Make sure other necessary functions are exported if they are used elsewhere
	getViewMode,
	setViewMode,
	updateMobileDayText, // Assuming these are defined elsewhere in the UI module
	updateMobileStageText, // Assuming these are defined elsewhere in the UI module
	showFavoritesModalWithActiveDay, // Assuming this is defined elsewhere
};