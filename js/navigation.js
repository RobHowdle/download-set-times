/**
 * Navigation Component
 * Handles the creation and management of the navigation header and side menu
 */

class NavigationComponent {
	constructor() {
		this.currentPage = this.getCurrentPage();
	}

	getCurrentPage() {
		const pathname = window.location.pathname;
		if (pathname.includes("vendors.html")) return "vendors";
		if (pathname.includes("map.html")) return "map";
		return "index";
	}

	/**
	 * Generate the complete navigation HTML
	 */
	generateNavigationHTML() {
		return `
            <!-- Mobile Header (visible only on small screens) -->
            <header class="block md:hidden mb-4">
                <!-- Logo and Menu Button Row -->
                <div class="flex justify-between items-center mb-4">
                    <img
                        src="assets/downloadlogo.svg"
                        alt="Download Festival"
                        class="h-8"
                    />                <button
                    id="menu-toggle-btn-mobile"
                    class="bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-3 rounded text-sm flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                </div>

                <!-- Timer Row -->
                <div class="flex justify-center">
                    <div class="flex items-center">
                        <div class="timer-unit text-center px-4">
                            <div class="timer-number text-2xl font-bold" id="days-mobile">00</div>
                            <div class="timer-label text-xs text-cyan-400">DAYS</div>
                        </div>
                        <div class="timer-unit text-center px-4">
                            <div class="timer-number text-2xl font-bold" id="hours-mobile">00</div>
                            <div class="timer-label text-xs text-cyan-400">HRS</div>
                        </div>
                        <div class="timer-unit text-center px-4">
                            <div class="timer-number text-2xl font-bold" id="minutes-mobile">00</div>
                            <div class="timer-label text-xs text-cyan-400">MINS</div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Desktop Header (visible only on medium+ screens) -->
            <header class="hidden md:flex md:justify-between md:items-center mb-6">
                <!-- Logo -->
                <img
                    src="assets/downloadlogo.svg"
                    alt="Download Festival"
                    class="h-12"
                />

                <!-- Timer -->
                <div class="flex items-center">
                    <div class="timer-unit text-center px-6">
                        <div class="timer-number text-3xl font-bold" id="days-desktop">00</div>
                        <div class="timer-label text-sm text-cyan-400">DAYS</div>
                    </div>
                    <div class="timer-unit text-center px-6">
                        <div class="timer-number text-3xl font-bold" id="hours-desktop">00</div>
                        <div class="timer-label text-sm text-cyan-400">HRS</div>
                    </div>
                    <div class="timer-unit text-center px-6">
                        <div class="timer-number text-3xl font-bold" id="minutes-desktop">00</div>
                        <div class="timer-label text-sm text-cyan-400">MINS</div>
                    </div>
                </div>

                <!-- Menu Button -->
                <button
                    id="menu-toggle-btn-desktop"
                    class="bg-cyan-700 hover:bg-cyan-600 text-white py-3 px-3 rounded text-base flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </header>

            <!-- Side Menu Overlay -->
            <div class="menu-overlay" id="menu-overlay"></div>

            <!-- Side Menu -->
            <div class="side-menu" id="side-menu">
                <div class="p-4 border-b border-gray-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-bold text-cyan-400">Download Festival</h2>
                        <button class="menu-close-btn text-gray-400 hover:text-white" id="menu-close-btn">
                            &times;
                        </button>
                    </div>
                </div>

                <nav class="mt-4">
                    <a href="index.html" class="menu-item ${
						this.currentPage === "index" ? "active" : ""
					}" id="menu-item-timetable">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Schedule</span>
                    </a>

                    <a href="vendors.html" class="menu-item ${
						this.currentPage === "vendors" ? "active" : ""
					}" id="menu-item-food">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Vendors
                    </a>

                    <a href="map.html" class="menu-item ${
						this.currentPage === "map" ? "active" : ""
					}" id="menu-map-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>Camp Map</span>
                    </a>

                    <button class="menu-item index-only" id="menu-favorites">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>My Artists</span>
                    </button>

                    <button class="menu-item index-only" id="menu-poster-generate">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Generate Poster</span>
                    </button>

                    <button class="menu-item index-only" id="menu-timetable-generate">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Timetable Wallpaper</span>
                    </button>
                </nav>
            </div>
        `;
	}

	/**
	 * Inject the navigation HTML into the page
	 */
	inject(targetSelector = "#navigation-placeholder") {
		const targetElement = document.querySelector(targetSelector);
		if (!targetElement) {
			console.error(
				"Navigation target element not found:",
				targetSelector
			);
			return;
		}

		// Create a container for the navigation
		const navContainer = document.createElement("div");
		navContainer.id = "navigation-container";
		navContainer.innerHTML = this.generateNavigationHTML();

		// Replace the placeholder with our navigation
		targetElement.innerHTML = "";
		targetElement.appendChild(navContainer);

		console.log("Navigation HTML injected");
	}

	/**
	 * Initialize the navigation component
	 */
	init(targetSelector = "#navigation-placeholder") {
		// Inject the navigation HTML
		this.inject(targetSelector);

		// Wait a short moment to ensure DOM is updated
		setTimeout(() => {
			console.log("Navigation loaded, dispatching event");
			// Dispatch an event to let other modules know navigation is loaded
			document.dispatchEvent(new CustomEvent("navigationLoaded"));
		}, 50);
	}
}

// Export for use in other modules
export default NavigationComponent;

// Auto-initialize if loaded directly
if (typeof window !== "undefined") {
	window.NavigationComponent = NavigationComponent;
}
