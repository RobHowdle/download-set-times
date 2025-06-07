const fs = require("fs");

// Read the vendors data
const vendorsData = JSON.parse(fs.readFileSync("vendors-data.json", "utf8"));

// Categorization rules based on vendor names
function categorizeVendor(name) {
	const upperName = name.toUpperCase();

	// Drinks/Bars
	if (
		upperName.includes("BAR") ||
		upperName.includes("COCKTAIL") ||
		upperName.includes("BEER") ||
		upperName.includes("SPIRIT") ||
		upperName.includes("WINE") ||
		upperName.includes("COFFEE") ||
		upperName.includes("JUICE") ||
		upperName.includes("SMOOTHIE") ||
		upperName.includes("DRINKS") ||
		upperName.includes("GUINNESS") ||
		upperName.includes("SOFT DRINKS")
	) {
		return "Drinks";
	}

	// Activities/Entertainment
	if (
		upperName.includes("BUNGEE") ||
		upperName.includes("WHEEL") ||
		upperName.includes("FLYER") ||
		upperName.includes("TRAIN") ||
		upperName.includes("WALTZER") ||
		upperName.includes("DODGEM") ||
		upperName.includes("FUN HOUSE") ||
		upperName.includes("ATMOSFEAR") ||
		upperName.includes("TATTOO") ||
		upperName.includes("AXE HEAD")
	) {
		return "Activities";
	}

	// Merchandise
	if (
		upperName.includes("RECORDS") ||
		upperName.includes("MUGS") ||
		upperName.includes("MERCH") ||
		upperName.includes("SHOP")
	) {
		return "Merchandise";
	}

	// Everything else is likely Food
	return "Food";
}

// Process all zones
Object.keys(vendorsData.zones).forEach((zoneName) => {
	const vendors = vendorsData.zones[zoneName].vendors;

	vendors.forEach((vendor) => {
		const type = categorizeVendor(vendor.name);

		// Add type tag if it doesn't exist
		if (!vendor.tags.includes(type)) {
			vendor.tags.push(type);
		}
	});
});

// Write back to file
fs.writeFileSync("vendors-data.json", JSON.stringify(vendorsData, null, 2));

console.log("Vendor categorization complete!");
console.log("Categories added to all vendors based on their names.");
