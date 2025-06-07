// Simple script to verify that vendors-data.json is valid and accessible
// Run this in the browser console or Node.js to check the file

async function verifyVendorsData() {
	console.log("Verifying vendors-data.json file...");

	try {
		// In browser
		if (typeof window !== "undefined") {
			const response = await fetch("vendors-data.json");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const text = await response.text();
			console.log(`File size: ${text.length} bytes`);

			try {
				const data = JSON.parse(text);
				console.log("JSON structure is valid");

				// Validate structure
				if (!data.zones) {
					console.error("Missing 'zones' property in data");
				} else {
					const zoneNames = Object.keys(data.zones);
					console.log(
						`Found ${zoneNames.length} zones: ${zoneNames.join(
							", "
						)}`
					);

					// Check each zone for vendors
					let totalVendors = 0;
					for (const zoneName of zoneNames) {
						const vendors = data.zones[zoneName].vendors || [];
						console.log(
							`Zone "${zoneName}" has ${vendors.length} vendors`
						);
						totalVendors += vendors.length;
					}
					console.log(
						`Total vendors across all zones: ${totalVendors}`
					);
				}

				return {
					valid: true,
					message: "vendors-data.json is valid and accessible",
				};
			} catch (parseError) {
				console.error("JSON parsing error:", parseError);
				console.log("First 100 characters:", text.substring(0, 100));
				return {
					valid: false,
					message: `JSON parsing error: ${parseError.message}`,
				};
			}
		} else {
			// In Node.js
			const fs = require("fs");
			const path = require("path");

			const filePath = path.join(process.cwd(), "vendors-data.json");
			console.log(`Checking file at: ${filePath}`);

			if (!fs.existsSync(filePath)) {
				return {
					valid: false,
					message: `File not found at ${filePath}`,
				};
			}

			const text = fs.readFileSync(filePath, "utf8");
			console.log(`File size: ${text.length} bytes`);

			try {
				const data = JSON.parse(text);
				console.log("JSON structure is valid");

				// Validate structure
				if (!data.zones) {
					console.error("Missing 'zones' property in data");
				} else {
					const zoneNames = Object.keys(data.zones);
					console.log(
						`Found ${zoneNames.length} zones: ${zoneNames.join(
							", "
						)}`
					);
				}

				return {
					valid: true,
					message: "vendors-data.json is valid and accessible",
				};
			} catch (parseError) {
				console.error("JSON parsing error:", parseError);
				return {
					valid: false,
					message: `JSON parsing error: ${parseError.message}`,
				};
			}
		}
	} catch (error) {
		console.error("Error accessing file:", error);
		return {
			valid: false,
			message: `Error accessing file: ${error.message}`,
		};
	}
}

// Auto-execute in browser
if (typeof window !== "undefined") {
	verifyVendorsData().then((result) => {
		console.log("Verification result:", result);
	});
}

// Export for Node.js
if (typeof module !== "undefined") {
	module.exports = verifyVendorsData;
}
