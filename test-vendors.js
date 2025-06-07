// Test script to validate vendors data
const fs = require("fs");

try {
	const vendorsData = JSON.parse(
		fs.readFileSync("./vendors-data.json", "utf8")
	);

	console.log("🧪 Testing vendors-data.json...\n");

	// Test 1: Basic structure
	console.log("✅ JSON structure is valid");

	// Test 2: Check all required sections exist
	const requiredSections = ["arena", "districtX", "village", "campsite"];
	requiredSections.forEach((section) => {
		if (vendorsData.vendors[section]) {
			console.log(
				`✅ ${section} section exists (${vendorsData.vendors[section].length} vendors)`
			);
		} else {
			console.log(`❌ ${section} section missing`);
		}
	});

	// Test 3: Check District X vendors specifically
	const districtXVendors = vendorsData.vendors.districtX;
	console.log(`\n📍 District X Vendors Analysis:`);
	console.log(`   Total vendors: ${districtXVendors.length}`);

	// Check for required properties in each vendor
	const requiredProperties = [
		"id",
		"name",
		"description",
		"type",
		"location",
		"menu",
		"paymentOptions",
	];
	let validVendors = 0;
	let issues = [];

	districtXVendors.forEach((vendor, index) => {
		const missing = requiredProperties.filter((prop) => !vendor[prop]);
		if (missing.length === 0) {
			validVendors++;
		} else {
			issues.push(
				`Vendor ${index + 1} (${
					vendor.name || "unnamed"
				}) missing: ${missing.join(", ")}`
			);
		}
	});

	console.log(`   Valid vendors: ${validVendors}/${districtXVendors.length}`);

	if (issues.length > 0) {
		console.log(`\n⚠️  Issues found:`);
		issues.forEach((issue) => console.log(`   ${issue}`));
	}

	// Test 4: Check for the new vendors we added
	const newVendorNames = [
		"BAO LONDON",
		"HONEST BURGERS",
		"RUDY'S PIZZA",
		"BUBBLE TEA CO.",
		"GELATO SISTERS",
		"STREET FEAST DONUTS",
		"COCKTAIL LOUNGE",
	];

	console.log(`\n🆕 Checking for new vendors:`);
	newVendorNames.forEach((name) => {
		const found = districtXVendors.find((v) => v.name === name);
		if (found) {
			console.log(`   ✅ ${name} found (ID: ${found.id})`);
		} else {
			console.log(`   ❌ ${name} not found`);
		}
	});

	// Test 5: Check menu items
	let totalMenuItems = 0;
	districtXVendors.forEach((vendor) => {
		if (vendor.menu && Array.isArray(vendor.menu)) {
			totalMenuItems += vendor.menu.length;
		}
	});

	console.log(
		`\n🍽️  Total menu items across all District X vendors: ${totalMenuItems}`
	);

	console.log("\n🎉 All tests completed!");
} catch (error) {
	console.error("❌ Error testing vendors data:", error.message);
}
