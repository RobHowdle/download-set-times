const fs = require("fs");
const data = JSON.parse(fs.readFileSync("vendors-data.json", "utf8"));

// 1. Check arena vendors
const arenaVendors = data.zones.filter(
	(vendor) =>
		Array.isArray(vendor.location) &&
		vendor.location.some((loc) => loc === "Arena")
);
console.log(
	`Found ${arenaVendors.length} vendors with location exactly "Arena"`
);

// 2. Check arena vendors with different case
const arenaVendorsCaseInsensitive = data.zones.filter(
	(vendor) =>
		Array.isArray(vendor.location) &&
		vendor.location.some(
			(loc) => loc.toLowerCase() === "arena".toLowerCase()
		)
);
console.log(
	`Found ${arenaVendorsCaseInsensitive.length} vendors with location "Arena" (case insensitive)`
);

// 3. Check the currentZone variable in the showTypes/showVendors function
console.log(
	`In vendors.html, currentZone appears to be set to a value like: "arena"`
);
console.log(
	`This would not match with "Arena" in a case-sensitive comparison.`
);

// 4. Show a few arena vendors as a sample
if (arenaVendors.length > 0) {
	console.log("\nSample Arena vendors:");
	arenaVendors.slice(0, 5).forEach((vendor) => {
		console.log(`- ${vendor.name} (location: ${vendor.location})`);
	});
}
