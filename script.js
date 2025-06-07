/**
 * Download Festival Set Times - Legacy Script File
 * This file now serves as a compatibility layer for the new modular structure
 */

// Import all modules
import {state, initState} from "./js/core.js";
import {loadData, extractStageNames} from "./js/data.js";
import {
	showDay,
	showDistrictXDay,
	filterStage,
	filterDistrictXStage,
	updateMobileStageText,
	updateMobileDayText,
	populateStageButtons,
	showFavoritesModalPatched,
	updateDistrictXMobileDayText,
	updateDistrictXMobileStageText,
} from "./js/ui.js";
import {
	saveFavorites,
	loadFavorites,
	checkFirstVisit,
	checkForConflicts,
	showFavoritesOnly,
	toggleFavoriteSet,
} from "./js/favourites.js";
import {setupEventListeners, setupOutsideClickListeners} from "./js/events.js";
import {
	setupPosterButton,
	generatePersonalizedPoster,
	loadPosterStyles,
} from "./js/poster.js";
import {
	setupDropdowns,
	setupDistrictXDropdownsDirectly,
	populateDistrictXStageDropdown,
	populateArenaStageDropdown,
} from "./js/dropdowns.js";
import {setupShareFavoritesButton, tryImportSharedFavorites} from "./js/ui.js";
import {showDaySelectionModal} from "./js/timetable.js";

// Export functions to window for backward compatibility with inline event handlers
window.showDay = showDay;
window.showDaySelectionModal = showDaySelectionModal;
window.showDistrictXDay = showDistrictXDay;
window.filterStage = filterStage;
window.filterDistrictXStage = filterDistrictXStage;
window.saveFavorites = saveFavorites;
window.showFavoritesModal = showFavoritesModalPatched;
window.generatePersonalizedPoster = generatePersonalizedPoster;
window.updateMobileStageText = updateMobileStageText;
window.updateMobileDayText = updateMobileDayText;
window.updateDistrictXMobileDayText = updateDistrictXMobileDayText;
window.updateDistrictXMobileStageText = updateDistrictXMobileStageText;
window.setupDistrictXDropdownsDirectly = setupDistrictXDropdownsDirectly;
window.populateDistrictXStageDropdown = populateDistrictXStageDropdown;
window.populateArenaStageDropdown = populateArenaStageDropdown;
window.showFavoritesOnly = showFavoritesOnly;
window.toggleFavoriteSet = toggleFavoriteSet;

// --- Now Playing ---

document.addEventListener('DOMContentLoaded', () => {
    let bandSchedule = []; // Initialize as an empty array
    const stagesContainerElem = document.getElementById('stagesContainer'); // New element to target
    const lastUpdatedElem = document.getElementById('lastUpdated');

    let currentPlayingBandsPerStage = {}; // Object to track current bands per stage to detect changes

    function formatTime(dateString) {
        const options = { hour: '2-digit', minute: '2-digit', hour12: false };
        return new Date(dateString).toLocaleTimeString('en-GB', options);
    }

    function updateStageDisplays() {
        const now = new Date();
        const stagesData = {}; // Object to hold currently playing and next up for each stage

        // Group and sort bands by stage
        bandSchedule.forEach(band => {
            if (!stagesData[band.stage]) {
                stagesData[band.stage] = {
                    currentlyPlaying: null,
                    upNext: null,
                    bands: [] // Store all bands for the stage to sort later
                };
            }
            stagesData[band.stage].bands.push(band);
        });

        // Process each stage
        Object.keys(stagesData).sort().forEach(stageName => { // Sort stage names for consistent display order
            const stage = stagesData[stageName];
            stage.bands.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // Sort bands within the stage by time

            let foundCurrentForStage = null;
            let foundNextForStage = null;

            for (let i = 0; i < stage.bands.length; i++) {
                const band = stage.bands[i];
                const startTime = new Date(band.startTime);
                const endTime = new Date(band.endTime);

                if (now >= startTime && now < endTime) {
                    foundCurrentForStage = band;
                    // Find the very next band for this stage
                    if (i + 1 < stage.bands.length) {
                        foundNextForStage = stage.bands[i + 1];
                    }
                    break; // Found current band for this stage, move to next stage
                } else if (now < startTime) {
                    // If no band is currently playing on this stage, the first upcoming band is 'up next'
                    foundNextForStage = band;
                    break; // Found the next upcoming, no need to check further for this stage
                }
            }

            stage.currentlyPlaying = foundCurrentForStage;
            stage.upNext = foundNextForStage;
        });

        // Now, render or update the HTML based on stagesData
        renderStageDisplays(stagesData);

        lastUpdatedElem.textContent = new Date().toLocaleTimeString('en-GB');
    }

    function renderStageDisplays(stagesData) {
        stagesContainerElem.innerHTML = ''; // Clear previous content

        // Sort stage names for consistent order
        const sortedStageNames = Object.keys(stagesData).sort();

        sortedStageNames.forEach(stageName => {
            const stage = stagesData[stageName];

            const stageDiv = document.createElement('div');
            stageDiv.classList.add('stage-section'); // Add a class for styling
            stageDiv.innerHTML = `
                <h2>${stageName}</h2>
                <div class="stage-info">
                    <h3>Currently Playing:</h3>
                    <p>Artist: <span class="current-artist">${stage.currentlyPlaying ? stage.currentlyPlaying.artist : 'No band currently playing.'}</span></p>
                    <p>Time: <span class="current-time">${stage.currentlyPlaying ? `${formatTime(stage.currentlyPlaying.startTime)} - ${formatTime(stage.currentlyPlaying.endTime)}` : ''}</span></p>
                </div>
                <div class="stage-info">
                    <h3>Up Next:</h3>
                    <p>Artist: <span class="next-artist">${stage.upNext ? stage.upNext.artist : 'No upcoming bands.'}</span></p>
                    <p>Time: <span class="next-time">${stage.upNext ? `${formatTime(stage.upNext.startTime)} - ${formatTime(stage.upNext.endTime)}` : ''}</span></p>
                </div>
            `;
            stagesContainerElem.appendChild(stageDiv);
        });
    }


    async function loadBandSchedule() {
        try {
            const response = await fetch('set-times.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            bandSchedule = await response.json();
            console.log('Band schedule loaded:', bandSchedule);
            updateStageDisplays(); // Initial display after data is loaded
        } catch (error) {
            console.error('Error loading band schedule:', error);
            stagesContainerElem.innerHTML = '<p>Error loading schedule. Please refresh the page.</p>';
        }
    }

    // Load the schedule when the page loads
    loadBandSchedule();

    // Update every 5 seconds (5000 milliseconds)
    setInterval(updateStageDisplays, 5000);
});

// --- Download Festival Weather Forecast ---
async function fetchWeather() {
	// Check if festival is within API data availability
	const today = new Date();
	const festStart = new Date("2025-06-11");
	const festEnd = new Date("2025-06-15");
	const maxForecastDays = 16;
	const daysToStart = Math.floor((festStart - today) / (1000 * 60 * 60 * 24));

	// Check if festival dates are too far in the future
	if (daysToStart > maxForecastDays) {
		console.log(
			`Weather API: Festival is ${daysToStart} days away. Forecast only available within ${maxForecastDays} days.`
		);
		return null;
	}

	// Check if festival dates are too far in the past
	const daysPast = Math.floor((today - festEnd) / (1000 * 60 * 60 * 24));
	if (daysPast > 365) {
		console.log(
			`Weather API: Festival was ${daysPast} days ago. Historical data only available for past year.`
		);
		return null;
	}

	const start = "2025-06-11";
	const end = "2025-06-15";

	// Use appropriate API endpoint based on date
	let baseUrl;
	if (festEnd < today) {
		// Use historical weather API for past dates
		baseUrl = "https://archive-api.open-meteo.com/v1/era5";
	} else {
		// Use forecast API for future dates
		baseUrl = "https://api.open-meteo.com/v1/forecast";
	}

	const url = `${baseUrl}?latitude=52.8306&longitude=-1.3756&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FLondon`;
	const timeoutMs = 5000; // 5 seconds
	let timeoutId;
	let didTimeout = false;
	return await Promise.race([
		(async () => {
			try {
				const res = await fetch(url);
				if (didTimeout) return null;
				if (!res.ok) throw new Error("Weather fetch failed");
				const data = await res.json();
				if (!data.daily || !data.daily.time) {
					console.warn(
						"Weather API returned unexpected structure:",
						data
					);
					return null;
				}
				return data.daily;
			} catch (e) {
				if (didTimeout) {
					console.error("Weather fetch timed out (catch block)");
				} else {
					console.error("Weather fetch error:", e);
				}
				return null;
			}
		})(),
		new Promise((resolve) => {
			timeoutId = setTimeout(() => {
				didTimeout = true;
				console.error("Weather fetch timed out (Promise.race)");
				resolve(null);
			}, timeoutMs);
		}),
	]).then((result) => {
		clearTimeout(timeoutId);
		return result;
	});
}

function renderWeather(forecast) {
	const container = document.getElementById("weather-forecast");
	if (!container) return;
	container.innerHTML = "";
	if (!forecast || !forecast.time) {
		container.innerHTML =
			'<span class="text-sm">Weather forecast will be available closer to the event!</span>';
		return;
	}
	const dayLabels = ["Wed", "Thu", "Fri", "Sat", "Sun"];
	for (let i = 0; i < forecast.time.length; i++) {
		const day = dayLabels[i] || forecast.time[i];
		const max = forecast.temperature_2m_max[i];
		const min = forecast.temperature_2m_min[i];
		const rain = forecast.precipitation_sum[i];
		const code = forecast.weathercode[i];
		const icon = getWeatherIcon(code);
		const div = document.createElement("div");
		div.className =
			"weather-card flex flex-col items-center bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-3 min-w-[80px] border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105";
		div.innerHTML = `
			<span class="font-bold text-cyan-300 mb-1 text-sm">${day}</span>
			<span class="text-3xl mb-2">${icon}</span>
			<div class="text-center space-y-1">
				<div class="flex flex-col">
					<span class="text-xs text-orange-300">High: ${max}°C</span>
					<span class="text-xs text-blue-300">Low: ${min}°C</span>
				</div>
				<div class="flex items-center justify-center gap-1 text-xs text-blue-400">
					<span>💧</span>
					<span>${rain}mm</span>
				</div>
			</div>
		`;
		container.appendChild(div);
	}
}

function getWeatherIcon(code) {
	// Simple mapping for demo
	if (code === 0) return "☀️";
	if (code < 3) return "🌤️";
	if (code < 45) return "☁️";
	if (code < 60) return "🌦️";
	if (code < 70) return "🌧️";
	if (code < 80) return "⛈️";
	return "❓";
}

// --- Campsite Map Modal Logic (static image version) ---
const mapModal = document.getElementById("map-modal");
const closeMapBtn = document.getElementById("close-map-btn");

// Map is now opened via the menu button in menu.js

// Only add close button event listener if the element exists
if (closeMapBtn) {
	closeMapBtn.addEventListener("click", () => {
		if (mapModal) {
			mapModal.classList.add("hidden");
		}
	});
}

// --- CAMP AREA HIGHLIGHTING LOGIC ---
// Define camp area polygons (image pixel coordinates, adjust as needed)
const CAMP_AREAS = {
	plus: [
		[
			{x: 1762, y: 981},
			{x: 1717, y: 862},
			{x: 1706, y: 806},
			{x: 1844, y: 646},
			{x: 1911, y: 691},
			{x: 1848, y: 769},
			{x: 1874, y: 762},
			{x: 1937, y: 777},
			{x: 1974, y: 739},
			{x: 2011, y: 758},
			{x: 2000, y: 777},
			{x: 2011, y: 795},
			{x: 2041, y: 810},
			{x: 2063, y: 799},
			{x: 2193, y: 873},
			{x: 2178, y: 918},
			{x: 1940, y: 907},
			{x: 1803, y: 1014},
			{x: 1803, y: 1014},
			{x: 1758, y: 981},
		],
	],
	eco: [
		[
			{x: 1851, y: 981},
			{x: 1859, y: 1025},
			{x: 2108, y: 1074},
			{x: 2175, y: 921},
			{x: 1937, y: 914},
		],
	],
	general: [
		[
			{x: 2346, y: 572},
			{x: 2119, y: 1077},
			{x: 2242, y: 1081},
			{x: 2602, y: 1044},
			{x: 2598, y: 858},
			{x: 2565, y: 654},
			{x: 2502, y: 613},
			{x: 2468, y: 613},
			{x: 2416, y: 583},
		],
		[
			{x: 2580, y: 524},
			{x: 2732, y: 498},
			{x: 2788, y: 516},
			{x: 2855, y: 505},
			{x: 2926, y: 528},
			{x: 2959, y: 661},
			{x: 2896, y: 672},
			{x: 2870, y: 713},
			{x: 2873, y: 780},
			{x: 2989, y: 769},
			{x: 3052, y: 981},
			{x: 3000, y: 1011},
			{x: 2781, y: 836},
			{x: 2769, y: 710},
			{x: 2580, y: 732},
			{x: 2569, y: 650},
			{x: 2598, y: 635},
		],
		[
			{x: 1048, y: 751},
			{x: 1089, y: 736},
			{x: 1141, y: 743},
			{x: 1197, y: 699},
			{x: 1264, y: 959},
			{x: 1193, y: 1044},
			{x: 1178, y: 1115},
			{x: 1230, y: 1148},
			{x: 1245, y: 1185},
			{x: 1312, y: 1230},
			{x: 1238, y: 1427},
			{x: 1197, y: 1393},
			{x: 1097, y: 1122},
		],
		[
			{x: 1279, y: 1341},
			{x: 1595, y: 1438},
			{x: 1509, y: 1635},
			{x: 1405, y: 1612},
			{x: 1427, y: 1546},
			{x: 1238, y: 1438},
		],
		[
			{x: 2836, y: 1011},
			{x: 2944, y: 1100},
			{x: 2859, y: 1170},
			{x: 2877, y: 1189},
			{x: 3015, y: 1260},
			{x: 2981, y: 1274},
			{x: 2866, y: 1267},
			{x: 2821, y: 1234},
			{x: 2799, y: 1215},
			{x: 2636, y: 1063},
			{x: 2669, y: 1025},
			{x: 2721, y: 1040},
			{x: 2743, y: 1063},
		],
	],
	quiet: [
		[
			{x: 1041, y: 747},
			{x: 1085, y: 1059},
			{x: 769, y: 1092},
			{x: 695, y: 1092},
			{x: 643, y: 862},
		],
	],
	access: [
		[
			{x: 2320, y: 1746},
			{x: 2305, y: 1854},
			{x: 2305, y: 1943},
			{x: 2331, y: 1947},
			{x: 2238, y: 2229},
			{x: 2011, y: 2159},
			{x: 2123, y: 1902},
			{x: 2145, y: 1880},
			{x: 2137, y: 1854},
			{x: 2089, y: 1821},
			{x: 2082, y: 1783},
		],
	],
	rip: [
		[
			{x: 1067, y: 1754},
			{x: 1171, y: 1817},
			{x: 1256, y: 1713},
			{x: 1543, y: 1761},
			{x: 1602, y: 1757},
			{x: 1803, y: 1731},
			{x: 1821, y: 1798},
			{x: 2030, y: 1772},
			{x: 2045, y: 1809},
			{x: 2100, y: 1873},
			{x: 2108, y: 1895},
			{x: 1985, y: 2170},
			{x: 1870, y: 2118},
			{x: 1814, y: 2237},
			{x: 1710, y: 2385},
			{x: 1639, y: 2437},
			{x: 1624, y: 2452},
			{x: 1584, y: 2452},
			{x: 1513, y: 2385},
			{x: 1372, y: 2300},
			{x: 1387, y: 2252},
			{x: 1063, y: 2051},
			{x: 1067, y: 2021},
			{x: 911, y: 1958},
		],
	],
	campervan: [
		[
			{x: 3030, y: 2356},
			{x: 2937, y: 2330},
			{x: 2840, y: 2389},
			{x: 2743, y: 2344},
			{x: 2621, y: 2300},
			{x: 2769, y: 2188},
			{x: 2892, y: 2133},
			{x: 3007, y: 2088},
			{x: 3093, y: 2066},
			{x: 3405, y: 2043},
			{x: 3416, y: 2084},
			{x: 3342, y: 2125},
			{x: 3264, y: 2181},
			{x: 3186, y: 2248},
			{x: 3123, y: 2296},
		],
	],
	campervan_plus: [
		[
			{x: 2795, y: 1512},
			{x: 2795, y: 1460},
			{x: 2821, y: 1438},
			{x: 3071, y: 1401},
			{x: 3137, y: 1427},
			{x: 3189, y: 1453},
			{x: 3264, y: 1464},
			{x: 3290, y: 1516},
			{x: 3275, y: 1575},
			{x: 2836, y: 1538},
		],
	],
	ready_to_rock: [
		[
			{x: 2468, y: 1300},
			{x: 2483, y: 1364},
			{x: 2717, y: 1423},
			{x: 2807, y: 1375},
			{x: 2636, y: 1334},
		],
	],
	mini_moshers: [
		[
			{x: 770, y: 1098},
			{x: 1088, y: 1058},
			{x: 1098, y: 1118},
			{x: 903, y: 1145},
			{x: 904, y: 1102},
		],
	],
};

// Map ticket types to allowed areas
const TICKET_AREAS = {
	general: ["general"],
	access: ["access"],
	rip: ["rip"],
	eco: ["eco"],
	quiet: ["quiet"],
	plus: ["plus"],
	ready_to_rock: ["ready_to_rock"],
	campervan: ["campervan"],
	campervan_plus: ["campervan_plus"],
	mini_moshers: ["mini_moshers"],
};

const mapImage = document.getElementById("map-image");
const mapCanvas = document.getElementById("map-canvas");
const ticketSelect = document.getElementById("ticket-type-select");

function resizeCanvasToImage() {
	if (!mapImage.complete) return;
	mapCanvas.width = mapImage.naturalWidth;
	mapCanvas.height = mapImage.naturalHeight;
	mapCanvas.style.width = mapImage.offsetWidth + "px";
	mapCanvas.style.height = mapImage.offsetHeight + "px";
}

// --- Only highlight allowed areas, do not dim others ---
function drawHighlights() {
	if (mapCanvas.style.opacity === "0") return; // Don't draw if hidden for zoom
	const ctx = mapCanvas.getContext("2d");
	ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	const ticket = ticketSelect.value;
	const allowed = TICKET_AREAS[ticket] || [];
	// Draw each allowed area with a bold, glowing, and more opaque style
	allowed.forEach((area) => {
		(CAMP_AREAS[area] || []).forEach((poly) => {
			ctx.save();
			ctx.globalAlpha = 0.7; // More opaque
			ctx.shadowColor = areaColor(area);
			ctx.shadowBlur = 32; // Glow effect
			ctx.fillStyle = areaColor(area);
			ctx.beginPath();
			poly.forEach((pt, i) => {
				if (i === 0) ctx.moveTo(pt.x, pt.y);
				else ctx.lineTo(pt.x, pt.y);
			});
			ctx.closePath();
			ctx.fill();
			ctx.shadowBlur = 0;
			ctx.globalAlpha = 1;
			// Add a thick white border for definition
			ctx.lineWidth = 10;
			ctx.strokeStyle = "#fff";
			ctx.stroke();
			// Add a colored border for the area
			ctx.lineWidth = 4;
			ctx.strokeStyle = areaColor(area);
			ctx.stroke();
			// Add a bright red border for extra definition
			ctx.lineWidth = 2.5;
			ctx.strokeStyle = "#ff1744"; // Bright red
			ctx.stroke();
			ctx.restore();
		});
	});
}

function areaColor(area) {
	switch (area) {
		case "general":
			return "#06b6d4";
		case "access":
			return "#a3e635";
		case "rip":
			return "#fbbf24";
		case "eco":
			return "#22d3ee";
		case "quiet":
			return "#818cf8";
		case "plus":
			return "#f472b6";
		case "mini_moshers":
			return "#f472b6";
		default:
			return "#fff";
	}
}

// Sync canvas with image size and zoom
function syncCanvas() {
	resizeCanvasToImage();
	drawHighlights();
}

// Redraw on ticket change
if (ticketSelect) {
	ticketSelect.addEventListener("change", drawHighlights);
}

// Redraw on image load/resize
if (mapImage) {
	mapImage.addEventListener("load", syncCanvas);
	window.addEventListener("resize", syncCanvas);
	// If already loaded
	if (mapImage.complete) setTimeout(syncCanvas, 100);
}

// If modal is opened, sync canvas
// Use existing mapModal variable if present, else define
var _mapModal =
	typeof mapModal !== "undefined"
		? mapModal
		: document.getElementById("map-modal");
if (_mapModal) {
	const observer = new MutationObserver(() => {
		if (!_mapModal.classList.contains("hidden")) {
			setTimeout(syncCanvas, 100);
		}
	});
	observer.observe(_mapModal, {attributes: true, attributeFilter: ["class"]});
}

// --- Hide highlights when zooming (hovering) ---
if (mapImage && mapCanvas) {
	mapImage.addEventListener("mouseenter", () => {
		mapCanvas.style.opacity = "0";
	});
	mapImage.addEventListener("mouseleave", () => {
		mapCanvas.style.opacity = "1";
		drawHighlights();
	});
}

// Initialize application
document.addEventListener("DOMContentLoaded", async function () {
	try {
		// Initialize state
		initState();
		window.state = state; // Ensure window.state is the same as the imported state

		// Load data
		await loadData();

		// Extract stage names for filters
		const stageNames = extractStageNames();

		// Populate UI components
		populateStageButtons(stageNames);
		populateArenaStageDropdown(stageNames);
		populateDistrictXStageDropdown(stageNames);

		// Show initial schedules
		showDay("friday");
		showDistrictXDay("wednesday");

		// Check if this is a first visit
		checkFirstVisit();

		// Load user preferences
		loadFavorites();

		// Check for schedule conflicts
		checkForConflicts();

		// Setup additional UI components
		loadPosterStyles();

		// Set up all event listeners
		setupEventListeners();
		setupOutsideClickListeners();
		setupDropdowns();

		// Weather forecast logic
		const today = new Date();
		const festStart = new Date("2025-06-11");
		const maxForecastDays = 16;
		const daysToStart = Math.floor(
			(festStart - today) / (1000 * 60 * 60 * 24)
		);
		const weatherContainer = document.getElementById("weather-forecast");
		if (daysToStart > maxForecastDays) {
			if (weatherContainer) {
				weatherContainer.innerHTML =
					'<span class="text-sm">Weather forecast available from 16 days before the festival.</span>';
			}
		} else {
			const forecast = await fetchWeather();
			renderWeather(forecast);
		}

		// Import shared favorites if any (now handles async operation)
		tryImportSharedFavorites()
			.then(() => {
				// Ensure share button is attached after DOM is fully rendered and
				// any shared favorites have been processed
				setTimeout(setupShareFavoritesButton, 0);
			})
			.catch((error) => {
				console.error("Error importing shared favorites:", error);
				setTimeout(setupShareFavoritesButton, 0);
			});
		// Patch overlays after rendering
		setTimeout(() => {
			window.patchGridForSharedFavorites &&
				window.patchGridForSharedFavorites();
		}, 1000);

		// Show favorites modal after data is loaded, if first visit
		if (state.showFavoritesModalAfterData) {
			setTimeout(() => {
				window.showFavoritesModal();
				state.showFavoritesModalAfterData = false;
			}, 0);
		}
	} catch (error) {
		console.error("Initialization error:", error);
		document.getElementById(
			"schedule"
		).innerHTML = `<div class="text-red-500 p-4">Failed to load festival data. Please try again later.</div>`;
		document.getElementById(
			"districtx-schedule"
		).innerHTML = `<div class="text-red-500 p-4">Failed to load festival data. Please try again later.</div>`;
	}
});

// For backward compatibility with any code that directly accesses these properties
window.data = state.data;
window.currentDay = state.currentDay;
window.districtXCurrentDay = state.districtXCurrentDay;
window.currentStage = state.currentStage;
window.districtXCurrentStage = state.districtXCurrentStage;
window.favoriteArtists = state.favoriteArtists;
window.showFavoritesOnly = state.showFavoritesOnly;
