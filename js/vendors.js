/**
 * Vendors Module
 * Handles loading, filtering, and displaying vendor data
 */

// State management
const state = {
	vendors: [],
	filteredVendors: [],
	filters: {
		search: "",
		location: "all",
		type: "all",
		dietary: [],
	},
	viewMode: "grid", // "grid" or "list"
};

// DOM elements
let vendorsContainer;
let searchInput;
let locationFilter;
let typeFilter;
let dietaryFilters;
let gridViewBtn;
let listViewBtn;
let resultsCount;

/**
 * Initialize the vendors module
 */
async function initialize() {
	// Get DOM elements
	vendorsContainer = document.getElementById("vendors-container");
	searchInput = document.getElementById("vendor-search");
	locationFilter = document.getElementById("location-filter");
	typeFilter = document.getElementById("type-filter");
	dietaryFilters = document.querySelectorAll(".dietary-filter");
	gridViewBtn = document.getElementById("grid-view-btn");
	listViewBtn = document.getElementById("list-view-btn");
	resultsCount = document.getElementById("results-count");

	// Add event listeners
	searchInput.addEventListener("input", handleSearchInput);
	locationFilter.addEventListener("change", handleLocationFilter);
	typeFilter.addEventListener("change", handleTypeFilter);
	dietaryFilters.forEach((filter) => {
		filter.addEventListener("change", handleDietaryFilter);
	});

	gridViewBtn.addEventListener("click", () => setViewMode("grid"));
	listViewBtn.addEventListener("click", () => setViewMode("list"));

	// Load vendor data
	await loadVendorData();

	// Populate filter options based on loaded data
	populateFilterOptions();

	// Initial render
	applyFilters();
	renderVendors();
}

/**
 * Load vendor data from JSON
 */
async function loadVendorData() {
	try {
		const response = await fetch("vendors-data.json");
		const data = await response.json();

		// Process vendors from the data
		if (data && data.zones) {
			// Use the new structure with zones array
			state.vendors = data.zones.map((vendor) => ({
				...vendor,
				// Ensure location is always an array
				location: Array.isArray(vendor.location)
					? vendor.location
					: [vendor.location || ""],
				// Extract dietary options from tags
				dietaryOptions: vendor.tags
					? vendor.tags.filter((tag) =>
							[
								"Halal",
								"Vegan Options",
								"Vegetarian Options",
								"Gluten Free Options",
								"Coeliac friendly",
								"Totally Vegan",
							].includes(tag)
					  )
					: [],
				// Set type based on tags or default to 'other'
				type:
					vendor.tags &&
					vendor.tags.some((tag) =>
						["Food", "Bar", "Experience"].includes(tag)
					)
						? vendor.tags
								.find((tag) =>
									["Food", "Bar", "Experience"].includes(tag)
								)
								.toLowerCase()
						: "other",
				// Add description placeholder
				description: vendor.description || `${vendor.name}`,
				// Check if budget friendly
				isCheap: vendor.tags
					? vendor.tags.includes("Meals under £10")
					: false,
			}));
		} else {
			// Fallback for old structure or empty data
			state.vendors = [];
			console.error("Invalid data structure in vendors-data.json");
		}

		state.filteredVendors = [...state.vendors];
	} catch (error) {
		console.error("Error loading vendor data:", error);
		vendorsContainer.innerHTML = `
      <div class="col-span-full bg-red-900 text-white p-4 rounded-lg">
        <h3 class="font-bold text-lg">Error Loading Data</h3>
        <p>Unable to load vendor information. Please try again later.</p>
      </div>
    `;
	}
}

/**
 * Populate filter dropdown options based on vendor data
 */
function populateFilterOptions() {
	// Populate location filter
	if (locationFilter) {
		// Get all unique locations from vendors
		const uniqueLocations = new Set();

		// First add "all" option
		uniqueLocations.add("all");

		// Then collect all locations from vendors
		state.vendors.forEach((vendor) => {
			if (Array.isArray(vendor.location)) {
				vendor.location.forEach((loc) => {
					if (loc && loc.trim() !== "") {
						uniqueLocations.add(loc);
					}
				});
			}
		});

		// Clear existing options
		locationFilter.innerHTML = "";

		// Add options to dropdown
		Array.from(uniqueLocations)
			.sort()
			.forEach((location) => {
				const option = document.createElement("option");
				option.value = location;
				option.textContent =
					location === "all" ? "All Locations" : location;
				locationFilter.appendChild(option);
			});
	}

	// If needed, populate other filters similarly
}

/**
 * Apply all current filters to the vendor data
 */
function applyFilters() {
	const {search, location, type, dietary} = state.filters;

	state.filteredVendors = state.vendors.filter((vendor) => {
		// Search filter
		const matchesSearch =
			search === "" ||
			vendor.name.toLowerCase().includes(search.toLowerCase()) ||
			vendor.description.toLowerCase().includes(search.toLowerCase());

		// Location filter - check if vendor's location array includes the selected location
		const matchesLocation =
			location === "all" ||
			(Array.isArray(vendor.location) &&
				(vendor.location.includes(location) ||
					vendor.location.some(
						(loc) => loc.toLowerCase() === location.toLowerCase()
					)));

		// Type filter
		const matchesType = type === "all" || vendor.type === type;

		// Dietary filters
		const matchesDietary =
			dietary.length === 0 ||
			(vendor.dietaryOptions &&
				dietary.every((diet) => vendor.dietaryOptions.includes(diet)));

		return (
			matchesSearch && matchesLocation && matchesType && matchesDietary
		);
	});

	// Update results count
	resultsCount.textContent = state.filteredVendors.length;
}

/**
 * Render vendors based on current view mode
 */
function renderVendors() {
	if (state.filteredVendors.length === 0) {
		vendorsContainer.innerHTML = `
      <div class="col-span-full bg-gray-800 p-6 rounded-lg text-center">
        <h3 class="font-bold text-xl mb-2">No Results Found</h3>
        <p class="text-gray-400">Try adjusting your search or filters</p>
      </div>
    `;
		return;
	}

	// Clear container
	vendorsContainer.innerHTML = "";

	// Set layout based on view mode
	if (state.viewMode === "grid") {
		vendorsContainer.className =
			"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
	} else {
		vendorsContainer.className = "flex flex-col gap-4";
	}

	// Render each vendor
	state.filteredVendors.forEach((vendor) => {
		const vendorElement = document.createElement("div");

		if (state.viewMode === "grid") {
			vendorElement.className =
				"bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-800/30 cursor-pointer transition-all duration-300";
			vendorElement.innerHTML = createGridCardHTML(vendor);
		} else {
			vendorElement.className =
				"bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full hover:shadow-cyan-800/30 cursor-pointer transition-all duration-300";
			vendorElement.innerHTML = createListCardHTML(vendor);
		}

		// Add click event listener to open the vendor modal
		vendorElement.addEventListener("click", handleVendorClick(vendor));

		vendorsContainer.appendChild(vendorElement);
	});
}

/**
 * Create HTML for grid view card
 */
function createGridCardHTML(vendor) {
	// Get dietary icons HTML if available
	const dietaryHTML = vendor.dietaryOptions
		? createDietaryIconsHTML(vendor.dietaryOptions)
		: "";

	// Create menu preview badge if available
	const menuBadge =
		vendor.menu && vendor.menu.categories
			? `<div class="mt-2 flex items-center gap-2">
            <span class="px-2 py-1 bg-cyan-900 text-cyan-200 rounded-full text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Menu Available
            </span>
          </div>`
			: "";

	// Create products preview badge for merchandise
	const productsPreview = vendor.products
		? `<div class="mt-2 flex items-center gap-2">
            <span class="px-2 py-1 bg-cyan-900 text-cyan-200 rounded-full text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Products Available
            </span>
          </div>`
		: "";

	return `
    <div class="relative">
      <div class="absolute top-0 right-0 m-2 px-2 py-1 bg-cyan-800 text-xs rounded">
        ${vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}
      </div>
      <div class="p-4">
        <h3 class="text-lg font-bold">${vendor.name}</h3>
        <p class="text-sm text-gray-300 mb-2">${vendor.description}</p>
        <p class="text-xs flex items-center gap-1 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          ${vendor.locationDetail || formatLocation(vendor.location)}
        </p>
        <p class="text-xs flex items-center gap-1 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ${vendor.openingTimes || "Open during event hours"}
        </p>
        
        ${dietaryHTML}
        ${menuBadge || productsPreview || ""}
        
        <div class="mt-3 text-xs text-cyan-400 flex items-center">
          <span>Tap for details</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create HTML for list view card
 */
function createListCardHTML(vendor) {
	// Get dietary icons HTML if available
	const dietaryHTML = vendor.dietaryOptions
		? createDietaryIconsHTML(vendor.dietaryOptions)
		: "";

	return `
    <div class="p-4 flex flex-col md:flex-row">
      <div class="md:w-1/3">
        <h3 class="text-lg font-bold">${vendor.name}</h3>
        <p class="text-sm text-gray-300 mb-2">${vendor.description}</p>
        <div class="flex items-center justify-between md:flex-col md:items-start">
          <span class="inline-block px-2 py-1 bg-cyan-800 text-xs rounded mb-2">
            ${vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}
          </span>
          <p class="text-xs flex items-center gap-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ${vendor.locationDetail} (${formatLocation(vendor.location)})
          </p>
          <p class="text-xs flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${vendor.openingTimes}
          </p>
        </div>
        ${dietaryHTML}
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        ${createDetailedListHTML(vendor)}
      </div>
    </div>
  `;
}

/**
 * Create detailed list content HTML based on vendor type
 */
function createDetailedListHTML(vendor) {
	// For the menu, we now show a preview with the "View Full Menu" button
	if (vendor.menu && vendor.menu.categories) {
		// Find the first category that has items
		const firstCategory = vendor.menu.categories.find(
			(cat) => cat.items && cat.items.length > 0
		);

		if (firstCategory) {
			// Show up to 3 menu items from the first category
			const previewItems = firstCategory.items.slice(0, 3);

			return `
			<div>
				<div class="flex justify-between items-center mb-2">
					<h4 class="font-bold text-sm text-gray-300">Menu Preview: ${
						firstCategory.name
					}</h4>
				</div>
				<ul class="text-sm space-y-2 mb-3">
					${previewItems
						.map(
							(item) => `
						<li class="bg-gray-700 bg-opacity-30 p-2 rounded">
							<div class="flex justify-between">
								<span class="font-bold">${item.name}</span>
								${item.price ? `<span>${item.price}</span>` : ""}
							</div>
							${
								item.description
									? `<p class="text-xs text-gray-400">${item.description}</p>`
									: ""
							}
						</li>
					`
						)
						.join("")}
				</ul>
				<div class="text-center mt-4">
					<span class="text-cyan-400 text-sm flex items-center justify-center">
						Tap to view full menu
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</div>
			</div>
			`;
		} else {
			return `
			<div class="text-center py-4">
				<span class="text-cyan-400 text-sm flex items-center justify-center">
					Tap to view details
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</span>
			</div>
			`;
		}
	} else if (vendor.products) {
		// Show up to 4 products
		const previewProducts = vendor.products.slice(0, 4);

		return `
		<div>
			<h4 class="font-bold text-sm text-gray-300 mb-2">Products:</h4>
			<ul class="text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
				${previewProducts
					.map(
						(product) => `
					<li class="bg-gray-700 bg-opacity-30 p-2 rounded flex justify-between">
						<span>${product.name}</span>
						<span class="font-bold">${product.price}</span>
					</li>
				`
					)
					.join("")}
			</ul>
			${
				vendor.products.length > 4
					? `
			<div class="text-center mt-4">
				<span class="text-cyan-400 text-sm flex items-center justify-center">
					Tap to view all ${vendor.products.length} products
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</span>
			</div>
			`
					: ""
			}
		</div>
		`;
	} else if (vendor.type === "activity") {
		return `
      <div>
        <h4 class="font-bold text-sm text-gray-300 mb-2">Activity Details:</h4>
        <p class="text-sm">${vendor.description}</p>
        <p class="mt-2 text-sm"><span class="font-bold">Price:</span> ${
			vendor.prices || "See details"
		}</p>
        <div class="text-center mt-4">
          <span class="text-cyan-400 text-sm flex items-center justify-center">
            Tap for more information
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    `;
	}

	return `
    <div class="py-4 text-center">
      <span class="text-cyan-400 text-sm flex items-center justify-center">
        Tap for details
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </span>
    </div>
  `;
}

/**
 * Create dietary icons HTML
 */
function createDietaryIconsHTML(dietaryOptions) {
	if (!dietaryOptions || dietaryOptions.length === 0) return "";

	return `
    <div class="flex flex-wrap gap-1 mt-1">
      ${dietaryOptions
			.map(
				(diet) =>
					`<span class="px-1 py-0.5 text-xs rounded bg-green-900 text-green-200">
          ${formatDietaryOption(diet)}
        </span>`
			)
			.join("")}
    </div>
  `;
}

/**
 * Format dietary option for display
 */
function formatDietaryOption(option) {
	switch (option) {
		case "vegetarian":
		case "Vegetarian":
			return "Vegetarian";
		case "vegan":
		case "Vegan":
			return "Vegan";
		case "glutenfree":
		case "GF_Free":
			return "Gluten-Free";
		case "Coeliac_friendly":
			return "Coeliac Friendly";
		case "dairyfree":
			return "Dairy-Free";
		case "nutfree":
			return "Nut-Free";
		case "Halal":
			return "Halal";
		default:
			return option;
			return option;
	}
}

/**
 * Format location for display
 */
function formatLocation(location) {
	switch (location) {
		case "arena":
		case "Arena":
			return "Arena";
		case "districtx":
		case "District X":
			return "District X";
		case "other":
		case "Other":
			return "Other Areas";
		case "village":
			return "Village";
		case "campsite":
			return "Campsite";
		default:
			return location;
	}
}

/**
 * Set view mode (grid or list)
 */
function setViewMode(mode) {
	state.viewMode = mode;

	// Update button styling
	if (mode === "grid") {
		gridViewBtn.classList.add("bg-cyan-600");
		listViewBtn.classList.remove("bg-cyan-600");
	} else {
		listViewBtn.classList.add("bg-cyan-600");
		gridViewBtn.classList.remove("bg-cyan-600");
	}

	renderVendors();
}

/**
 * Handle search input
 */
function handleSearchInput(event) {
	state.filters.search = event.target.value.trim();
	applyFilters();
	renderVendors();
}

/**
 * Handle location filter change
 */
function handleLocationFilter(event) {
	state.filters.location = event.target.value;
	applyFilters();
	renderVendors();
}

/**
 * Handle type filter change
 */
function handleTypeFilter(event) {
	state.filters.type = event.target.value;
	applyFilters();
	renderVendors();
}

/**
 * Handle dietary filter changes
 */
function handleDietaryFilter() {
	// Get all checked dietary filters
	state.filters.dietary = Array.from(dietaryFilters)
		.filter((filter) => filter.checked)
		.map((filter) => filter.value);

	applyFilters();
	renderVendors();
}

/**
 * Display the vendor modal with details including menu
 */
function showVendorModal(vendor) {
	const modal = document.getElementById("vendor-modal");
	const modalTitle = document.getElementById("vendor-modal-title");
	const modalContent = document.getElementById("vendor-modal-content");

	if (!modal || !modalTitle || !modalContent) {
		console.error("Modal elements not found in the DOM");
		return;
	}

	// Set the title
	modalTitle.textContent = vendor.name;

	// Build the modal content
	let contentHTML = `
    <div class="mb-4 pb-4 border-b border-gray-700">
      <div class="flex flex-wrap gap-2 mb-3">
        <span class="inline-block px-2 py-1 bg-cyan-800 text-xs rounded">
          ${formatLocation(vendor.location)}
        </span>
        <span class="inline-block px-2 py-1 bg-cyan-800 text-xs rounded">
          ${
				Array.isArray(vendor.type)
					? vendor.type.join(", ")
					: vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)
			}
        </span>
      </div>
      <p class="text-gray-300">${vendor.description}</p>
    </div>
  `;

	// --- FIX: Show all categories as "Categories" ---
	if (vendor.category && vendor.category.length > 0) {
		contentHTML += `
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Categories</h3>
        <div class="flex flex-wrap gap-2">
          ${vendor.category
				.map(
					(option) =>
						`<span class="px-2 py-1 bg-green-900 text-green-200 text-sm rounded">${option}</span>`
				)
				.join("")}
        </div>
      </div>
    `;
	}

	// Add menu if available with our new structure
	if (
		vendor.menu &&
		vendor.menu.categories &&
		vendor.menu.categories.length > 0
	) {
		contentHTML += `
      <div class="mb-4">
        ${
			vendor.menu.description
				? `<p class="mb-4 text-gray-300">${vendor.menu.description}</p>`
				: ""
		}
        
        <div class="border-b border-gray-700 mb-4 pb-2">
          <h2 class="text-xl font-bold text-white">Menu</h2>
        </div>
        
        ${vendor.menu.categories
			.map(
				(category) => `
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-cyan-400">${
				category.name
			}</h3>
            <div class="space-y-3">
              ${category.items
					.map(
						(item) => `
                <div class="bg-gray-800 p-3 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">${item.name}</span>
                    ${
						item.price
							? `<span class="text-cyan-300 font-semibold">${item.price}</span>`
							: ""
					}
                  </div>
                  ${
						item.description
							? `<p class="text-sm text-gray-400 mt-1">${item.description}</p>`
							: ""
					}
                </div>
              `
					)
					.join("")}
            </div>
          </div>
        `
			)
			.join("")}
      </div>
    `;
	} else if (vendor.menu) {
		// For backward compatibility with the old menu structure
		contentHTML += `
      <div class="mb-4">
        <div class="border-b border-gray-700 mb-4 pb-2">
          <h2 class="text-xl font-bold text-white">Menu</h2>
        </div>
        
        <div class="space-y-3">
          ${
				Array.isArray(vendor.menu)
					? vendor.menu
							.map(
								(item) => `
            <div class="bg-gray-800 p-3 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="font-medium">${item.name}</span>
                ${
					item.price
						? `<span class="text-cyan-300 font-semibold">${item.price}</span>`
						: ""
				}
              </div>
              ${
					item.description
						? `<p class="text-sm text-gray-400 mt-1">${item.description}</p>`
						: ""
				}
            </div>
          `
							)
							.join("")
					: '<p class="text-gray-400">Menu information format is not supported.</p>'
			}
        </div>
      </div>
    `;
	} else {
		// If no menu, display a message
		contentHTML += `
      <div class="py-4 text-center">
        <p class="text-gray-400">No menu information available for this vendor.</p>
      </div>
    `;
	}

	// Set the content
	modalContent.innerHTML = contentHTML;

	// Show the modal
	modal.classList.remove("hidden");

	// Add event listeners for closing the modal
	document
		.getElementById("vendor-modal-backdrop")
		.addEventListener("click", closeVendorModal);
	document
		.getElementById("vendor-modal-close")
		.addEventListener("click", closeVendorModal);

	// Prevent scrolling on the body
	document.body.style.overflow = "hidden";
}

/**
 * Close the vendor modal
 */
function closeVendorModal() {
	const modal = document.getElementById("vendor-modal");
	modal.classList.add("hidden");

	// Re-enable scrolling
	document.body.style.overflow = "";

	// Remove event listeners
	document
		.getElementById("vendor-modal-backdrop")
		.removeEventListener("click", closeVendorModal);
	document
		.getElementById("vendor-modal-close")
		.removeEventListener("click", closeVendorModal);
}

/**
 * Handle vendor card click
 */
function handleVendorClick(vendor) {
	return function (event) {
		event.preventDefault();
		showVendorModal(vendor);
	};
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initialize);
