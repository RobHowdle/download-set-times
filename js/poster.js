/**
 * Poster Module
 * Handles generation of personalized festival posters
 */

import {state} from "./core.js";
import {timeToMinutes, formatTimeDisplay} from "./utils.js";
import {CustomAlert} from "./ui.js";

//Declare imported CustomAlert function.
const customAlert = new CustomAlert();

/**
 * Initialize poster generator button
 */
export function setupPosterButton() {
	if (!document.getElementById("generate-poster")) {
		const floatingBtn = document.createElement("button");
		floatingBtn.id = "generate-poster";
		floatingBtn.className =
			"fixed right-4 bottom-4 bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg flex items-center shadow-lg z-20";
		floatingBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      My Poster
    `;
		document.body.appendChild(floatingBtn);
		floatingBtn.addEventListener("click", generatePersonalizedPoster);
	}
}

/**
 * Start the poster generation process
 */
export function generatePersonalizedPoster() {
	// Check if we have favorites
	if (!state.favoriteSets || state.favoriteSets.length === 0) {
		customAlert.alert("Please add some favorite artists first!");
		return;
	}

	// Create name input popup
	showNameInputDialog().then((name) => {
		// Use the name (or default) to create the poster
		if (name && name.trim()) {
			createPersonalizedPoster(name || "My");
		}
		// If name is null or empty, do nothing (cancelled)
	});

	// When creating the modal container, add the poster-modal class:
	const modalContainer = document.createElement("div");
	modalContainer.className =
		"fixed inset-0 bg-black bg-opacity-90 flex items-center justify-content poster-modal";

	// When creating the poster element:
	const posterElement = document.createElement("div");
	posterElement.className = "poster-rendering";
	// Rest of your code...

	// Add download button outside the scrollable area
	const controlsContainer = document.createElement("div");
	controlsContainer.className =
		"fixed bottom-6 left-0 right-0 flex justify-center z-50";
}

/**
 * Show a dialog to input name for personalization
 * @returns {Promise<string>} The entered name or empty string if skipped
 */
function showNameInputDialog() {
	return new Promise((resolve) => {
		// Create modal for the name input
		const modal = document.createElement("div");
		modal.className =
			"fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
		modal.id = "name-input-modal";

		// Create input container
		const container = document.createElement("div");
		container.className =
			"bg-gray-800 rounded-lg p-6 max-w-md mx-auto text-center border-2 border-cyan-500 shadow-lg";

		// Add title
		const title = document.createElement("h2");
		title.className = "text-xl font-bold text-cyan-400 mb-4";
		title.innerText = "Personalize Your Poster";

		// Create input field
		const inputWrapper = document.createElement("div");
		inputWrapper.className = "mb-6";

		const label = document.createElement("label");
		label.className =
			"block text-left text-sm font-medium text-gray-300 mb-2";
		label.htmlFor = "name-input";
		label.innerText = "Enter your name:";

		const input = document.createElement("input");
		input.type = "text";
		input.id = "name-input";
		input.className =
			"w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500";
		input.placeholder = "Your name";
		input.maxLength = 30;

		inputWrapper.appendChild(label);
		inputWrapper.appendChild(input);

		// Create buttons
		const buttonGroup = document.createElement("div");
		buttonGroup.className = "flex space-x-4 justify-center";

		// Add Skip button
		const skipButton = document.createElement("button");
		skipButton.className =
			"px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 transition ml-2";
		skipButton.innerText = "Skip";
		skipButton.onclick = () => {
			// Remove all name input modals if present
			document
				.querySelectorAll("#name-input-modal")
				.forEach((el) => el.remove());
			resolve("My"); // Use default name
		};
		buttonGroup.appendChild(skipButton);

		// Add Continue button
		const confirmButton = document.createElement("button");
		confirmButton.className =
			"px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition ml-2";
		confirmButton.innerText = "Continue";
		confirmButton.onclick = () => {
			const name = input.value.trim();
			// Remove all name input modals if present
			document
				.querySelectorAll("#name-input-modal")
				.forEach((el) => el.remove());
			resolve(name || "My"); // Use entered name or default
		};
		buttonGroup.appendChild(confirmButton);

		// Add Cancel button
		const cancelButton = document.createElement("button");
		cancelButton.className =
			"px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition ml-2";
		cancelButton.innerText = "Cancel";
		cancelButton.onclick = () => {
			// Remove all name input modals if present
			document
				.querySelectorAll("#name-input-modal")
				.forEach((el) => el.remove());
			resolve(null); // Cancel
		};
		buttonGroup.appendChild(cancelButton);

		// Add keyboard event listener
		input.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				confirmButton.click();
			}
		});

		// Set focus on input
		setTimeout(() => input.focus(), 100);

		// Assemble the modal
		container.appendChild(title);
		container.appendChild(inputWrapper);
		container.appendChild(buttonGroup);
		modal.appendChild(container);

		document.body.appendChild(modal);
	});
}

/**
 * Create and display a personalized festival lineup poster
 * @param {string} name - The name to use for personalization
 */
function createPersonalizedPoster(name) {
	// Create modal for the poster
	const modal = document.createElement("div");
	modal.className =
		"fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 poster-modal"; // Added poster-modal class
	modal.id = "poster-modal";

	// Detect if we're on mobile
	const isMobile = window.innerWidth < 768;
	const isExtraSmall = window.innerWidth < 350;

	// Create poster container with height constraints
	const posterContainer = document.createElement("div");
	posterContainer.className = `relative rounded-lg overflow-auto ${
		isMobile ? "poster-container-mobile" : "poster-rendering max-w-3xl p-6"
	}`;

	// Create poster content with adaptive styling
	const posterContent = document.createElement("div");
	posterContent.id = "poster-content";
	posterContent.className = `text-center download-poster-style ${
		isMobile ? "poster-content-mobile" : ""
	}`;
	posterContent.style.padding = isMobile
		? isExtraSmall
			? "12px 8px"
			: "16px 10px"
		: "40px 20px";
	posterContent.style.width = isMobile ? "100%" : "auto";

	// Format the name properly for display
	const displayName = name === "My" ? "My" : `${name}'s`;

	// Add enhanced abstract background layers
	posterContent.innerHTML = `
    <div class="poster-bg-main"></div>
    <div class="poster-bg-effect"></div>
    <div class="poster-bg-bubbles"></div>
    <div class="poster-bg-swirl"></div>
    <div class="poster-bg-noise"></div>
    <div class="mb-8 relative z-10">
      <h1 class="text-5xl font-extrabold text-white mb-2 download-logo-text">DOWNLOAD FESTIVAL 2025</h1>
      <div class="text-lg text-cyan-100 mt-2">DONINGTON PARK • 11-15 JUNE</div>
      <div class="mt-2 mb-6 text-sm text-cyan-500 uppercase font-bold">${displayName} Personal Lineup</div>
    </div>
  `;

	// Create close button
	const closeBtn = document.createElement("button");
	closeBtn.innerHTML = "×";
	closeBtn.className =
		"absolute top-2 right-4 text-white text-3xl hover:text-gray-400 z-10";
	closeBtn.onclick = () => {
		// Remove all poster modals and name input modals if present
		document
			.querySelectorAll("#poster-modal, #name-input-modal")
			.forEach((el) => el.remove());
	};

	// Sort artists by venue and headliner status
	const arenaArtists = collectArenaArtists();
	const districtArtists = collectDistrictXArtists();

	// Sort by headliner status (using time as proxy - headliners play later)
	sortArtistsByTime(arenaArtists);
	sortArtistsByTime(districtArtists);

	// Create Arena artists section
	if (arenaArtists.length > 0) {
		const arenaSection = createArenaSection(
			arenaArtists,
			isMobile,
			isExtraSmall
		);
		posterContent.appendChild(arenaSection);
	}

	// Create District X artists section
	if (districtArtists.length > 0) {
		const districtSection = createDistrictXSection(
			districtArtists,
			isMobile
		);
		posterContent.appendChild(districtSection);
	}

	// Add footer with personalized name
	const footer = document.createElement("div");
	footer.className = "text-sm text-cyan-200 mt-10";
	footer.innerHTML = `
    <p>DONINGTON PARK 11-15 JUNE 2025</p>
    <p class="text-xs mt-4 opacity-60">Created with Download Festival Set Times App</p>
  `;
	posterContent.appendChild(footer);

	// Add download button
	const downloadBtn = createDownloadButton(displayName, name, isMobile);

	// Create a fixed position container for the download button
	const downloadContainer = document.createElement("div");
	downloadContainer.className =
		"fixed bottom-6 left-0 right-0 flex justify-center z-50";
	downloadContainer.appendChild(downloadBtn);

	// Add a secondary close button at the bottom for accessibility
	const bottomCloseBtn = document.createElement("button");
	bottomCloseBtn.className =
		"mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition";
	bottomCloseBtn.innerText = "Close";
	bottomCloseBtn.onclick = () => {
		document
			.querySelectorAll("#poster-modal, #name-input-modal")
			.forEach((el) => el.remove());
	};

	// Add everything to the DOM
	posterContainer.appendChild(closeBtn);
	posterContainer.appendChild(posterContent);
	posterContainer.appendChild(downloadBtn);
	modal.appendChild(posterContainer);
	modal.appendChild(downloadContainer);
	modal.appendChild(bottomCloseBtn);
	document.body.appendChild(modal);
}

/**
 * Collect all favorite artists from Arena stages
 */
function collectArenaArtists() {
	const arenaArtists = [];

	Object.keys(state.data.arena).forEach((day) => {
		Object.keys(state.data.arena[day]).forEach((stage) => {
			state.data.arena[day][stage].forEach((set) => {
				const setKey = `${set.artist}|${day}|${stage}|${set.start}`;
				if (state.favoriteSets.some((fav) => fav.setKey === setKey)) {
					arenaArtists.push({
						artist: set.artist,
						stage: stage,
						day: day,
						time: set.start,
					});
				}
			});
		});
	});

	return arenaArtists;
}

/**
 * Collect all favorite artists from District X stages
 */
function collectDistrictXArtists() {
	const districtArtists = [];

	Object.keys(state.data.districtX).forEach((day) => {
		if (!state.data.districtX[day]) return;

		Object.keys(state.data.districtX[day]).forEach((stage) => {
			if (Array.isArray(state.data.districtX[day][stage])) {
				state.data.districtX[day][stage].forEach((set) => {
					const setKey = `${set.artist}|${day}|${stage}|${set.start}`;
					if (
						state.favoriteSets.some((fav) => fav.setKey === setKey)
					) {
						districtArtists.push({
							artist: set.artist,
							stage: stage,
							day: day,
							time: set.start,
						});
					}
				});
			}
		});
	});

	return districtArtists;
}

/**
 * Sort artists by time (later times first - for headliner detection)
 */
function sortArtistsByTime(artists) {
	artists.sort((a, b) => {
		if (!a.time || !b.time) return 0;
		const aTime = timeToMinutes(a.time);
		const bTime = timeToMinutes(b.time);
		return bTime - aTime; // Later times (headliners) first
	});
}

/**
 * Create the arena section for the poster
 */
function createArenaSection(arenaArtists, isMobile, isExtraSmall) {
	const arenaSection = document.createElement("div");
	arenaSection.className = "mb-10 relative";

	// Divide artists into tiers
	let tierCount = Math.min(4, Math.ceil(arenaArtists.length / 4));

	for (let i = 0; i < tierCount; i++) {
		const startIndex = Math.floor((i * arenaArtists.length) / tierCount);
		const endIndex = Math.floor(
			((i + 1) * arenaArtists.length) / tierCount
		);
		const tierArtists = arenaArtists.slice(startIndex, endIndex);

		const tier = document.createElement("div");
		tier.className = `poster-tier tier-${i + 1} mb-5`;

		tierArtists.forEach((artist) => {
			const artistSpan = document.createElement("span");
			artistSpan.className = `artist-name inline-block ${
				isMobile ? "mx-1 my-1" : "mx-3 my-2"
			}`;

			// Adjust font sizes for device
			const fontSize = isMobile
				? isExtraSmall
					? Math.max(11, 18 - i * 2)
					: Math.max(13, 20 - i * 3)
				: 28 - i * 5;

			artistSpan.style.fontSize = `${fontSize}px`;
			artistSpan.style.fontWeight = "800";
			artistSpan.style.color = "#FFFFFF";

			// Adjust glow intensity for device
			const glowIntensity = isMobile ? Math.max(1, 3 - i) : 5 - i;
			artistSpan.style.textShadow = `0 0 ${glowIntensity}px #0ff, 0 0 ${
				glowIntensity + 2
			}px rgba(0,255,255,0.8)`;

			artistSpan.style.letterSpacing = isMobile ? "0.5px" : "1px";
			artistSpan.innerText = artist.artist.toUpperCase();
			tier.appendChild(artistSpan);
		});

		arenaSection.appendChild(tier);

		// Add divider lines between tiers
		if (i < tierCount - 1 && i < 2) {
			const divider = document.createElement("div");
			divider.className = "my-6 mx-auto w-3/4 opacity-60";
			divider.style.height = "2px";
			divider.style.background =
				"linear-gradient(90deg, rgba(0,255,255,0) 0%, #0ff 50%, rgba(0,255,255,0) 100%)";
			arenaSection.appendChild(divider);
		}
	}

	return arenaSection;
}

/**
 * Create the District X section for the poster
 */
function createDistrictXSection(districtArtists, isMobile) {
	const districtSection = document.createElement("div");
	districtSection.className = "mb-8 mt-4";

	const districtArtistDiv = document.createElement("div");
	districtArtistDiv.className = "flex flex-wrap justify-center";

	districtArtists.forEach((artist) => {
		const artistSpan = document.createElement("span");
		artistSpan.className = `artist-name inline-block mx-2 my-1`;
		artistSpan.style.fontSize = isMobile ? "11px" : "13px";
		artistSpan.style.fontWeight = "600";
		artistSpan.style.letterSpacing = "0.5px";
		artistSpan.style.color = "#FFFFFF";
		artistSpan.style.textShadow =
			"0 0 3px #0ff, 0 0 5px rgba(0,255,255,0.6)";
		artistSpan.innerText = artist.artist.toUpperCase();
		districtArtistDiv.appendChild(artistSpan);
	});

	districtSection.appendChild(districtArtistDiv);
	return districtSection;
}

/**
 * Create the download button for the poster
 */
function createDownloadButton(displayName, name, isMobile) {
	const downloadBtn = document.createElement("button");
	downloadBtn.className = isMobile
		? "mt-3 bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg flex items-center mx-auto text-sm"
		: "mt-6 bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-6 rounded-lg flex items-center mx-auto";

	downloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Download ${displayName} Poster
  `;

	downloadBtn.onclick = () => {
		// Check if html2canvas is available
		if (typeof html2canvas !== "undefined") {
			const content = document.getElementById("poster-content");

			html2canvas(content, {
				backgroundColor: "#030b1f",
				scale: 2,
				logging: true,
				allowTaint: true,
				useCORS: true,
			})
				.then((canvas) => {
					const link = document.createElement("a");
					link.download = `${
						name === "My" ? "my" : name.toLowerCase()
					}-download-festival-lineup.png`;
					link.href = canvas.toDataURL("image/png");
					link.click();
				})
				.catch((err) => {
					alert(
						"Sorry, there was an error creating your poster: " +
							err.message
					);
				});
		} else {
			alert("Cannot generate download - html2canvas library not loaded.");
		}
	};

	return downloadBtn;
}

/**
 * Add CSS styles required for poster generation
 */
export function loadPosterStyles() {
	// Check if styles already exist
	if (document.getElementById("poster-styles")) return;

	const styleSheet = document.createElement("style");
	styleSheet.id = "poster-styles";
	styleSheet.innerHTML = `
    .download-poster-style {
      /* Remove background-color and background for poster, let styles.css handle it */
      border-radius: 12px;
      box-shadow: 0 0 40px 8px #06b6d4, 0 0 0 2px #06b6d4;
      position: relative;
      overflow: hidden;
      font-family: 'Arial', sans-serif;
      text-transform: uppercase;
    }
    .download-poster-style:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 12px;
      pointer-events: none;
      box-shadow: 0 0 60px 10px #06b6d4, 0 0 0 3px #06b6d4;
      opacity: 0.18;
      z-index: 2;
    }
    .poster-bg-main, .poster-bg-effect, .poster-bg-bubbles, .poster-bg-swirl, .poster-bg-noise {
      display: none !important;
    }
    .download-logo-text {
      font-family: 'Arial Black', 'Impact', sans-serif;
      letter-spacing: -0.5px;
      text-shadow: 0 0 10px #06b6d4, 0 0 20px #06b6d4;
    }
    .poster-day-heading {
      position: relative;
      z-index: 20;
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #fff;
      margin: 32px 0 16px 0;
      padding: 8px 0 8px 0;
      text-align: center;
      letter-spacing: 2px;
      text-shadow: 0 2px 12px #000, 0 0 8px #06b6d4;
    }
    .poster-day-heading-bg {
      position: absolute;
      left: 0; right: 0; top: 0; bottom: 0;
      background: rgba(3,11,31,0.7);
      border-radius: 8px;
      z-index: 10;
      pointer-events: none;
    }
    @media (max-width: 600px) {
      .poster-day-heading {
        font-size: 1.2rem;
        margin: 18px 0 10px 0;
        padding: 6px 0 6px 0;
      }
    }
  `;

	document.head.appendChild(styleSheet);
}
