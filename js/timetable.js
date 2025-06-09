// timetable.js - Generate timetable wallpaper
import {CustomAlert} from "./ui.js";
import {state} from "./core.js";

const customAlert = new CustomAlert();
const TARGET_PNG_WIDTH = 1179;
const TARGET_PNG_HEIGHT = 2556;
const CONTENT_LAYOUT_WIDTH = 900;
const BASE_ROOT_FONT_SIZE_PX = 30;
const BASE_TOP_SPACER_HEIGHT_PX = 300;
const BASE_BOTTOM_SPACER_HEIGHT_PX = 200;
const timetableCaptureArea = document.getElementById("timetableCaptureArea");

// --- Event Listener for DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
	const timetableCaptureArea = document.getElementById(
		"timetableCaptureArea"
	);
	if (!timetableCaptureArea) {
		console.error(
			"Timetable capture area element (#timetableCaptureArea) not found on DOMContentLoaded!"
		);
	}
	checkAndEnableDownloadButton("menu-timetable-generate");
});

// --- Function to check for enable parameters ---
function checkAndEnableDownloadButton(buttonId) {
	const btn = document.getElementById(buttonId);
	if (btn) {
		// Make sure we check if there are actually favorite sets selected
		if (
			window.state &&
			window.state.data &&
			Array.isArray(window.state.favoriteSets)
		) {
			btn.disabled = false;
		} else {
			btn.disabled = true;
		}
	} else {
		console.warn(
			`Download Timetable button with ID '${buttonId}' not found for enablement check.`
		);
	}
}

window.checkAndEnableDownloadButton = checkAndEnableDownloadButton;

// --- Display Modal to select day ---
export function showDaySelectionModal() {
	if (
		!window.state ||
		!Array.isArray(window.state.favoriteSets) ||
		!window.state.favoriteSets.length
	) {
		console.warn(
			"[Wallpaper] No favorite sets found for wallpaper generation."
		);
		customAlert.alert("Please add some favorite artists first!");
		return;
	}

	// Determine available days from favorite sets
	const availableDays = new Set();

	// First check if we have District X data for Wednesday and Thursday
	if (window.state.data && window.state.data.districtX) {
		if (window.state.data.districtX.wednesday)
			availableDays.add("wednesday");
		if (window.state.data.districtX.thursday) availableDays.add("thursday");
	}

	// Then add days from favorite sets
	window.state.favoriteSets.forEach((fav) => {
		const parts = fav.setKey.split("|");
		if (parts.length >= 2) {
			availableDays.add(parts[1]);
		}
	});

	const sortedDays = Array.from(availableDays).sort((a, b) => {
		const dayOrder = {
			wednesday: 1,
			thursday: 2,
			friday: 3,
			saturday: 4,
			sunday: 5,
		};
		return (
			(dayOrder[a.toLowerCase()] || 99) -
			(dayOrder[b.toLowerCase()] || 99)
		); // Use 99 for unknown days, usually errors.
	});

	// Create modal
	const modal = document.createElement("div");
	modal.className =
		"fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
	modal.id = "day-selection-modal";

	// Create input container
	const container = document.createElement("div");
	container.className =
		"bg-gray-800 rounded-lg p-6 max-w-md mx-auto text-center border-2 border-cyan-500 shadow-lg";

	// Add title
	const title = document.createElement("h2");
	title.className = "text-xl font-bold text-cyan-400 mb-4";
	title.innerText = "Select Day for Timetable";

	// Create buttons for each day
	const buttonGroup = document.createElement("div");
	buttonGroup.className = "flex flex-col space-y-4 justify-center"; // Use flex-col for vertical stack

	if (sortedDays.length === 0) {
		const noDaysText = document.createElement("p");
		noDaysText.className = "text-gray-300";
		noDaysText.innerText =
			"No favorite artists found with valid day information.";
		buttonGroup.appendChild(noDaysText);
	} else {
		// Make sure Wednesday and Thursday always show up
		const allDays = new Set(
			["wednesday", "thursday", ...sortedDays].map((day) =>
				day.toLowerCase()
			)
		);

		// Create buttons for all days
		Array.from(allDays)
			.sort((a, b) => {
				const dayOrder = {
					wednesday: 1,
					thursday: 2,
					friday: 3,
					saturday: 4,
					sunday: 5,
				};
				return (
					(dayOrder[a.toLowerCase()] || 99) -
					(dayOrder[b.toLowerCase()] || 99)
				);
			})
			.forEach((day) => {
				const dayButton = document.createElement("button");
				dayButton.className =
					"px-6 py-3 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition text-lg font-semibold";
				dayButton.innerText =
					day.charAt(0).toUpperCase() + day.slice(1); // Capitalize first letter
				dayButton.onclick = () => {
					modal.remove(); // Close modal
					generateVerticalTimetablePNG(day); // Generate for the selected day
				};
				buttonGroup.appendChild(dayButton);
			});
	}

	// Add a close button
	const closeButton = document.createElement("button");
	closeButton.className =
		"mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition";
	closeButton.innerText = "Close";
	closeButton.onclick = () => {
		// Remove all day-selection-modal overlays if more than one exists
		document
			.querySelectorAll("#day-selection-modal")
			.forEach((el) => el.remove());
	};
	buttonGroup.appendChild(closeButton);

	// Assemble the modal
	container.appendChild(title);
	container.appendChild(buttonGroup);
	modal.appendChild(container);

	document.body.appendChild(modal);
}

/**
 * Generates the vertical list timetable HTML, applies dynamic font scaling,
 * and opens the generated image in a new tab.
 * @param {string | null} selectedDay The day to filter artists by (e.g., 'friday', 'saturday'), or null for all days.
 */
async function generateVerticalTimetablePNG(selectedDay = null) {
	const timetableCaptureArea = document.getElementById(
		"timetableCaptureArea"
	);
	timetableCaptureArea.innerHTML = "";
	timetableCaptureArea.style.width = "";
	timetableCaptureArea.style.height = "";
	timetableCaptureArea.style.transform = "";
	timetableCaptureArea.style.position = "absolute";
	timetableCaptureArea.style.left = "-99999px"; // CRITICAL: Always keep it way off-screen
	timetableCaptureArea.style.top = "-99999px"; // CRITICAL: Always keep it way off-screen
	timetableCaptureArea.style.overflow = "visible";
	timetableCaptureArea.style.display = "block";
	timetableCaptureArea.style.fontSize = `${BASE_ROOT_FONT_SIZE_PX}px`;

	// --- Data Validation (Simple backup, as soon have been checked before loading Modal) ---
	const state = window.state;

	const favoriteArtistsArray = [];
	const favoriteSetKeys = new Set(
		state.favoriteSets.map((fav) => fav.setKey)
	);
	const getSetKey = (artist, day, stage, start) =>
		`${artist}|${day}|${stage}|${start}`;

	["arena", "districtX"].forEach((venueKey) => {
		if (!state.data[venueKey]) {
			return;
		}
		Object.keys(state.data[venueKey]).forEach((dayKey) => {
			if (!state.data[venueKey][dayKey]) {
				return;
			}
			if (
				selectedDay &&
				dayKey.toLowerCase() !== selectedDay.toLowerCase()
			) {
				return;
			}
			Object.keys(state.data[venueKey][dayKey]).forEach((stageKey) => {
				if (!Array.isArray(state.data[venueKey][dayKey][stageKey])) {
					return;
				}
				state.data[venueKey][dayKey][stageKey].forEach((set) => {
					const setKey = getSetKey(
						set.artist,
						dayKey,
						stageKey,
						set.start
					);
					if (favoriteSetKeys.has(setKey)) {
						if (
							set &&
							set.artist &&
							stageKey &&
							set.start &&
							set.end
						) {
							favoriteArtistsArray.push({
								name: set.artist,
								stage: stageKey,
								day: dayKey,
								start: set.start,
								end: set.end,
							});
						} else {
							console.warn(
								`[Wallpaper] Skipping incomplete favorite artist data for setKey: ${setKey} due to missing properties.`,
								set
							);
						}
					}
				});
			});
		});
	});

	if (favoriteArtistsArray.length === 0) {
		let message = "";
		if (selectedDay === "wednesday" || selectedDay === "thursday") {
			message = `No favorite artist data found for ${
				selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
			}. Please make sure you've added favorites for District X events.`;
		} else {
			message = `No favorite artist data found for ${
				selectedDay
					? selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
					: "the selected days"
			} to generate a timetable.`;
		}
		console.warn("[Wallpaper] " + message);
		customAlert.alert(message);
		return;
	}

	// --- Sort Artists ---
	const timeToMinutes = (timeStr) => {
		if (!timeStr) return NaN;
		const parts = timeStr.trim().split(":").map(Number);
		if (parts.length !== 2) return NaN;
		return parts[0] * 60 + parts[1];
	};

	const sortedArtists = favoriteArtistsArray.sort((a, b) => {
		// Sort first by Day
		const dayOrder = {
			wednesday: 1,
			thursday: 2,
			friday: 3,
			saturday: 4,
			sunday: 5,
		};
		if (dayOrder[a.day.toLowerCase()] !== dayOrder[b.day.toLowerCase()]) {
			return (
				(dayOrder[a.day.toLowerCase()] || 99) -
				(dayOrder[b.day.toLowerCase()] || 99)
			);
		}
		// Then by Stage
		if (a.stage < b.stage) return -1;
		if (a.stage > b.stage) return 1;
		// Then by Time
		const timeA = timeToMinutes(a.start);
		const timeB = timeToMinutes(b.start);
		return timeA - timeB;
	});

	// --- Generate HTML Structure (Vertical List) ---
	let htmlContent = "";
	htmlContent += `<div class="top-spacer" style="height:${BASE_TOP_SPACER_HEIGHT_PX}px;"></div>`;

	let currentDayInContent = null;
	let currentStageInContent = null;

	sortedArtists.forEach((artist) => {
		if (artist.day !== currentDayInContent) {
			if (currentDayInContent !== null) {
				if (currentStageInContent !== null) {
					htmlContent += `</div>`;
				}
			}
			htmlContent += `<h2 class="day-heading">${
				artist.day.charAt(0).toUpperCase() + artist.day.slice(1)
			}</h2>`;
			currentDayInContent = artist.day;
			currentStageInContent = null;
		}

		if (artist.stage !== currentStageInContent) {
			if (currentStageInContent !== null) {
				htmlContent += `</div>`;
			}
			htmlContent += `<div class="stage-section">`;
			htmlContent += `<h3>${artist.stage}</h3>`;
			currentStageInContent = artist.stage;
		}

		const escapedName = (artist.name || "Unknown Artist")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
			.replace(/\r?\n/g, " ");
		const displayTime = `${artist.start || "N/A"} - ${artist.end || "N/A"}`;
		const escapedTime = displayTime
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
			.replace(/\r?\n/g, " ");

		htmlContent += `
            <div class="artist-entry">
                <span class="entry-text">${escapedTime} ${escapedName}</span>
            </div>
        `;
	});

	if (currentStageInContent !== null) {
		htmlContent += `</div>`;
	}

	htmlContent += `<div class="bottom-spacer" style="height:${BASE_BOTTOM_SPACER_HEIGHT_PX}px;"></div>`;

	// --- Insert HTML and Measure Content Size with BASE_ROOT_FONT_SIZE_PX ---
	timetableCaptureArea.innerHTML = htmlContent;

	// Ensure the capture area is off-screen during all measurements
	timetableCaptureArea.style.position = "absolute";
	timetableCaptureArea.style.left = "-9999px";
	timetableCaptureArea.style.top = "-9999px";
	timetableCaptureArea.style.width = `${CONTENT_LAYOUT_WIDTH}px`;
	timetableCaptureArea.style.height = "";
	timetableCaptureArea.style.overflow = "visible";

	// Give the browser more time to render before measuring
	await new Promise((resolve) =>
		requestAnimationFrame(() => setTimeout(resolve, 300))
	);

	const contentHeightAtBaseFontSize = timetableCaptureArea.scrollHeight;

	// --- Calculate Dynamic Font Scaling ---
	let finalFontScale = 1;

	if (contentHeightAtBaseFontSize > TARGET_PNG_HEIGHT) {
		// If content is too long, shrink the fonts to fit
		finalFontScale = TARGET_PNG_HEIGHT / contentHeightAtBaseFontSize;
	}

	// Calculations of new sizes based on finalFontScale
	const newRootFontSize = BASE_ROOT_FONT_SIZE_PX * finalFontScale;
	const newTopSpacerHeight = BASE_TOP_SPACER_HEIGHT_PX * finalFontScale;
	const newBottomSpacerHeight = BASE_BOTTOM_SPACER_HEIGHT_PX * finalFontScale;

	// --- Apply Dynamic Font Size and Spacer Heights ---
	timetableCaptureArea.style.fontSize = `${newRootFontSize}px`;

	const updatedTopSpacer = timetableCaptureArea.querySelector(".top-spacer");
	if (updatedTopSpacer) {
		updatedTopSpacer.style.height = `${newTopSpacerHeight}px`;
	}
	const updatedBottomSpacer =
		timetableCaptureArea.querySelector(".bottom-spacer");
	if (updatedBottomSpacer) {
		updatedBottomSpacer.style.height = `${newBottomSpacerHeight}px`;
	}

	// --- Recalculate content height after applying new font size ---
	await new Promise((resolve) =>
		requestAnimationFrame(() => setTimeout(resolve, 100))
	);
	const finalContentHeight = timetableCaptureArea.scrollHeight;

	// --- Prepare timetableCaptureArea for final capture ---
	timetableCaptureArea.style.width = `${TARGET_PNG_WIDTH}px`;
	timetableCaptureArea.style.height = `${TARGET_PNG_HEIGHT}px`;
	timetableCaptureArea.style.overflow = "hidden";

	// --- Calculate Vertical Centering Offset ---
	const verticalOffset = (TARGET_PNG_HEIGHT - finalContentHeight) / 2;

	// --- Apply final positioning (move to visible area for capture) ---
	timetableCaptureArea.style.position = "fixed";
	timetableCaptureArea.style.left = "0";
	timetableCaptureArea.style.top = "0";
	timetableCaptureArea.style.zIndex = "9999";
	timetableCaptureArea.style.visibility = "visible";
	timetableCaptureArea.style.opacity = "1";

	// Wait for positioning to take effect
	await new Promise((resolve) => setTimeout(resolve, 100));

	try {
		const canvas = await html2canvas(timetableCaptureArea, {
			width: TARGET_PNG_WIDTH,
			height: TARGET_PNG_HEIGHT,
			scale: 1,
			logging: true,
			useCORS: true,
			backgroundColor: "#000000",
		});

		// --- Create the image and download it ---
		const imgDataUrl = canvas.toDataURL("image/png");

		// Create a download link and trigger it
		const downloadLink = document.createElement("a");
		downloadLink.href = imgDataUrl;
		downloadLink.download = `Download-Festival-${
			selectedDay || "Schedule"
		}.png`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);

		customAlert.alert("Your timetable wallpaper is downloading.");
	} catch (error) {
		console.error("[Wallpaper] Error generating timetable PNG:", error);
		customAlert.alert(
			"Could not generate the timetable image. An error occurred during capture. Check the console for details."
		);
	} finally {
		// --- Clean Up - Hide the element again ---
		timetableCaptureArea.innerHTML = "";
		timetableCaptureArea.style.width = "";
		timetableCaptureArea.style.height = "";
		timetableCaptureArea.style.position = "absolute";
		timetableCaptureArea.style.left = "-9999px";
		timetableCaptureArea.style.top = "-9999px";
		timetableCaptureArea.style.zIndex = "";
		timetableCaptureArea.style.visibility = "hidden";
		timetableCaptureArea.style.opacity = "0";
		timetableCaptureArea.style.transform = "";
		timetableCaptureArea.style.overflow = "";
		timetableCaptureArea.style.display = "";
		timetableCaptureArea.style.fontSize = "";
	}
}

// Make functions available globally
window.showDaySelectionModal = showDaySelectionModal;
