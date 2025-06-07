// Test script for vendor filtering
// Run this after opening vendors-new.html in a browser

console.log("Testing vendor filtering implementation");

// Check for 'Arena' vendors
const arenaVendors = vendorData.zones.filter(
	(vendor) =>
		Array.isArray(vendor.location) &&
		vendor.location.some(
			(loc) => loc.trim().toLowerCase() === "arena".trim().toLowerCase()
		)
);
console.log(`Found ${arenaVendors.length} vendors in Arena location`);

// Log the first few Arena vendors
arenaVendors.slice(0, 3).forEach((vendor, index) => {
	console.log(`Arena vendor ${index + 1}: ${vendor.name}`);
	console.log(`  Location: ${vendor.location}`);
	console.log(`  Tags: ${vendor.tags ? vendor.tags.join(", ") : "No tags"}`);
});

// Test filtering by both location and tag
// Example: Arena + Food
const arenaFoodVendors = vendorData.zones.filter(
	(vendor) =>
		Array.isArray(vendor.location) &&
		vendor.location.some(
			(loc) => loc.trim().toLowerCase() === "arena".trim().toLowerCase()
		) &&
		Array.isArray(vendor.tags) &&
		vendor.tags.includes("Food")
);
console.log(`Found ${arenaFoodVendors.length} Food vendors in Arena location`);

// Count total unique tags across all vendors
const allTags = new Set();
vendorData.zones.forEach((vendor) => {
	if (Array.isArray(vendor.tags)) {
		vendor.tags.forEach((tag) => allTags.add(tag));
	}
});
console.log(
	`Found ${allTags.size} unique tags across all vendors:`,
	Array.from(allTags)
);

// Count total unique locations
const allLocations = new Set();
vendorData.zones.forEach((vendor) => {
	if (Array.isArray(vendor.location)) {
		vendor.location.forEach((loc) => {
			if (loc && loc.trim() !== "") {
				allLocations.add(loc.trim());
			}
		});
	}
});
console.log(
	`Found ${allLocations.size} unique locations:`,
	Array.from(allLocations)
);
