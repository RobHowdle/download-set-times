const fs = require('fs');

// Read the vendors-data.json file
const data = JSON.parse(fs.readFileSync('./vendors-data.json', 'utf8'));

// Get all unique locations
const uniqueLocations = new Set();

data.zones.forEach(vendor => {
  if (Array.isArray(vendor.location)) {
    vendor.location.forEach(loc => {
      if (loc && loc.trim() !== "") {
        uniqueLocations.add(loc);
      }
    });
  }
});

console.log('Unique Locations:');
console.log(Array.from(uniqueLocations).sort());
console.log(`Total unique locations: ${uniqueLocations.size}`);
