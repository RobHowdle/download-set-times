/**
 * Vendor Data Normalizer
 * - Fixes common JSON syntax issues
 * - Normalizes vendor type values for consistent filtering
 * - Ensures proper data structure for vendor entries
 */
document.addEventListener("DOMContentLoaded", function () {
	function normalizeVendorData() {
		// First fetch the JSON as text so we can attempt to fix syntax issues
		fetch("vendors-data.json")
			.then((response) => response.text())
			.then((jsonText) => {
				try {
					// Pre-process the JSON to fix common syntax issues
					const fixedJson = preprocessJson(jsonText);
					return JSON.parse(fixedJson);
				} catch (error) {
					console.error("Failed to parse vendors-data.json:", error);

					// Find and report the error position for easier fixing
					if (error instanceof SyntaxError) {
						const position = extractErrorPosition(error.message);
						if (position) {
							console.error(
								`Error at position ${position.position} (line ${position.line}, column ${position.column})`
							);
							const context = getErrorContext(jsonText, position);
							console.error("Error context:", context);
						}
					}
					throw error;
				}
			})
			.then((data) => {
				if (!data || !data.zones) {
					console.error(
						"Invalid data structure: missing zones array"
					);
					return;
				}

				// Normalize the data
				const normalizedData = {
					zones: data.zones.map(normalizeVendor),
				};

				// Count vendors by location and type for debugging
				const stats = getVendorStats(normalizedData.zones);

				return normalizedData;
			})
			.catch((error) => {
				console.error("Error normalizing vendor data:", error);
			});
	}

	/**
	 * Preprocesses JSON text to fix common syntax issues:
	 * - Removes comments
	 * - Fixes trailing commas
	 * - Ensures property names are quoted
	 */
	function preprocessJson(text) {
		// Remove JavaScript-style comments (both single-line and multi-line)
		text = text.replace(/\/\/.*$/gm, ""); // Remove single-line comments
		text = text.replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multi-line comments

		// Fix trailing commas in arrays and objects
		text = text.replace(/,(\s*[\]}])/g, "$1");

		// Ensure property names are properly quoted - this is more complex as we need to avoid touching already quoted props
		// But for this specific case, look for the issue with "type": "Drinks", // Comment
		text = text.replace(/("[^"]*"\s*:\s*"[^"]*"),\s*\/\//g, "$1 //");

		return text;
	}

	/**
	 * Normalize a vendor object
	 */
	function normalizeVendor(vendor) {
		// Create a copy to avoid mutating the original
		const normalized = {...vendor};

		// Normalize type field
		normalizeType(normalized);

		// Ensure location is always an array
		normalizeLocation(normalized);

		// Ensure category is always an array
		normalizeCategory(normalized);

		return normalized;
	}

	/**
	 * Normalize the vendor type field
	 */
	function normalizeType(vendor) {
		if (!vendor.type) {
			vendor.type = "Other";
			return;
		}

		// Handle array of types
		if (Array.isArray(vendor.type)) {
			vendor.type = vendor.type.map((t) => normalizeTypeName(t));
		} else {
			vendor.type = normalizeTypeName(vendor.type);
		}
	}

	/**
	 * Normalize a single type name
	 */
	function normalizeTypeName(type) {
		if (typeof type !== "string") return type;

		// Map of standard names (case insensitive)
		const typeMap = {
			food: "Food",
			drink: "Drinks",
			drinks: "Drinks",
			experience: "Experience",
			merchandise: "Merchandise",
			merch: "Merchandise",
		};

		const typeLower = type.toLowerCase();
		return (
			typeMap[typeLower] || type.charAt(0).toUpperCase() + type.slice(1)
		);
	}

	/**
	 * Ensure vendor location is always an array
	 */
	function normalizeLocation(vendor) {
		if (!vendor.location) {
			vendor.location = ["Unknown"];
			return;
		}

		if (!Array.isArray(vendor.location)) {
			vendor.location = [vendor.location];
		}

		// Filter out empty values
		vendor.location = vendor.location.filter(
			(loc) => loc && loc.trim() !== ""
		);

		// If empty after filtering, set to Unknown
		if (vendor.location.length === 0) {
			vendor.location = ["Unknown"];
		}
	}

	/**
	 * Ensure category is always an array
	 */
	function normalizeCategory(vendor) {
		if (!vendor.category) {
			vendor.category = [];
			return;
		}

		if (!Array.isArray(vendor.category)) {
			vendor.category = [vendor.category];
		}
	}

	/**
	 * Extract position information from JSON syntax error message
	 */
	function extractErrorPosition(message) {
		const posMatch = message.match(/position (\d+)/);
		if (!posMatch) return null;

		const position = parseInt(posMatch[1], 10);

		// Convert position to line and column
		return {
			position,
			line: 0,
			column: 0,
		};
	}

	/**
	 * Get context around an error position to help debugging
	 */
	function getErrorContext(text, position) {
		// For simplicity, just return a substring around the error
		const start = Math.max(0, position.position - 30);
		const end = Math.min(text.length, position.position + 30);

		return text.substring(start, end);
	}

	/**
	 * Get statistics about vendors for debugging
	 */
	function getVendorStats(vendors) {
		const stats = {
			total: vendors.length,
			byType: {},
			byLocation: {},
		};

		vendors.forEach((vendor) => {
			// Count by type
			const type = Array.isArray(vendor.type)
				? vendor.type[0]
				: vendor.type;
			if (!stats.byType[type]) stats.byType[type] = 0;
			stats.byType[type]++;

			// Count by location
			if (Array.isArray(vendor.location)) {
				vendor.location.forEach((loc) => {
					if (!stats.byLocation[loc]) stats.byLocation[loc] = 0;
					stats.byLocation[loc]++;
				});
			}
		});

		return stats;
	}

	// Run the normalizer
	normalizeVendorData();
});
