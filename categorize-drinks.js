const fs = require("fs");

// Read the vendors data
const vendorsData = JSON.parse(fs.readFileSync("vendors-data.json", "utf8"));

// Function to add drink-specific categories based on vendor names
function categorizeDrinkVendors() {
	Object.keys(vendorsData.zones).forEach((zoneName) => {
		vendorsData.zones[zoneName].vendors.forEach((vendor) => {
			// Only process vendors that have "Drinks" in their tags
			if (vendor.tags && vendor.tags.includes("Drinks")) {
				const name = vendor.name.toLowerCase();

				// Add specific drink categories based on name patterns
				if (name.includes("cocktail") || name.includes("spirit")) {
					if (!vendor.tags.includes("Cocktails")) {
						vendor.tags.push("Cocktails");
					}
				}

				if (name.includes("beer") || name.includes("guinness")) {
					if (!vendor.tags.includes("Beer")) {
						vendor.tags.push("Beer");
					}
				}

				if (name.includes("coffee") || name.includes("caffe")) {
					if (!vendor.tags.includes("Coffee")) {
						vendor.tags.push("Coffee");
					}
				}

				if (name.includes("soft drinks") || name.includes("no & low")) {
					if (!vendor.tags.includes("Non_Alcoholic")) {
						vendor.tags.push("Non_Alcoholic");
					}
				}

				// General bars that don't fit specific categories
				if (
					name.includes("bar") &&
					!name.includes("cocktail") &&
					!name.includes("spirit") &&
					!name.includes("beer") &&
					!name.includes("soft drinks")
				) {
					if (!vendor.tags.includes("Mixed_Bar")) {
						vendor.tags.push("Mixed_Bar");
					}
				}

				// Wine bars (if any)
				if (name.includes("wine")) {
					if (!vendor.tags.includes("Wine")) {
						vendor.tags.push("Wine");
					}
				}
			}
		});
	});
}

// Apply the categorization
console.log("Starting categorization...");
let drinkVendorsFound = 0;
let categoriesAdded = 0;

Object.keys(vendorsData.zones).forEach((zoneName) => {
	vendorsData.zones[zoneName].vendors.forEach((vendor) => {
		// Only process vendors that have "Drinks" in their tags
		if (vendor.tags && vendor.tags.includes("Drinks")) {
			drinkVendorsFound++;
			console.log(`Processing drink vendor: ${vendor.name}`);
			const name = vendor.name.toLowerCase();

			// Add specific drink categories based on name patterns
			if (name.includes("cocktail") || name.includes("spirit")) {
				if (!vendor.tags.includes("Cocktails")) {
					vendor.tags.push("Cocktails");
					categoriesAdded++;
					console.log(`  Added Cocktails to ${vendor.name}`);
				}
			}

			if (name.includes("beer") || name.includes("guinness")) {
				if (!vendor.tags.includes("Beer")) {
					vendor.tags.push("Beer");
					categoriesAdded++;
					console.log(`  Added Beer to ${vendor.name}`);
				}
			}

			if (name.includes("coffee") || name.includes("caffe")) {
				if (!vendor.tags.includes("Coffee")) {
					vendor.tags.push("Coffee");
					categoriesAdded++;
					console.log(`  Added Coffee to ${vendor.name}`);
				}
			}

			if (name.includes("soft drinks") || name.includes("no & low")) {
				if (!vendor.tags.includes("Non_Alcoholic")) {
					vendor.tags.push("Non_Alcoholic");
					categoriesAdded++;
					console.log(`  Added Non_Alcoholic to ${vendor.name}`);
				}
			}

			// General bars that don't fit specific categories
			if (
				name.includes("bar") &&
				!name.includes("cocktail") &&
				!name.includes("spirit") &&
				!name.includes("beer") &&
				!name.includes("soft drinks")
			) {
				if (!vendor.tags.includes("Mixed_Bar")) {
					vendor.tags.push("Mixed_Bar");
					categoriesAdded++;
					console.log(`  Added Mixed_Bar to ${vendor.name}`);
				}
			}

			// Wine bars (if any)
			if (name.includes("wine")) {
				if (!vendor.tags.includes("Wine")) {
					vendor.tags.push("Wine");
					categoriesAdded++;
					console.log(`  Added Wine to ${vendor.name}`);
				}
			}
		}
	});
});

console.log(
	`Found ${drinkVendorsFound} drink vendors, added ${categoriesAdded} categories`
);

// Write the updated data back to the file
fs.writeFileSync("vendors-data.json", JSON.stringify(vendorsData, null, 2));

console.log(
	"✅ Drink vendors have been categorized with specific beverage types!"
);
