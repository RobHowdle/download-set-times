const fs = require("fs");

// Read the vendors data
const vendorsData = JSON.parse(fs.readFileSync("vendors-data.json", "utf8"));

console.log("=== VENDOR STATISTICS ===");

Object.keys(vendorsData.zones).forEach((zoneName) => {
	const vendors = vendorsData.zones[zoneName].vendors;
	console.log(`\n${zoneName}: ${vendors.length} total vendors`);

	// Count by type
	const typeCounts = {};
	vendors.forEach((vendor) => {
		vendor.tags.forEach((tag) => {
			if (["Food", "Drinks", "Activities", "Merchandise"].includes(tag)) {
				typeCounts[tag] = (typeCounts[tag] || 0) + 1;
			}
		});
	});

	Object.keys(typeCounts).forEach((type) => {
		console.log(`  ${type}: ${typeCounts[type]} vendors`);
	});
});

console.log("\n=== SAMPLE VENDORS BY TYPE ===");

// Show some examples
Object.keys(vendorsData.zones).forEach((zoneName) => {
	const vendors = vendorsData.zones[zoneName].vendors;
	console.log(`\n${zoneName} Examples:`);

	["Food", "Drinks", "Activities", "Merchandise"].forEach((type) => {
		const examples = vendors
			.filter((v) => v.tags.includes(type))
			.slice(0, 3);
		if (examples.length > 0) {
			console.log(`  ${type}: ${examples.map((v) => v.name).join(", ")}`);
		}
	});
});
