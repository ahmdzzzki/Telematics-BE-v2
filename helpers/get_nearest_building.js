const axios = require('axios');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const getNearestBuildingName = async (lat, lon) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${lat},${lon}`,
                radius: 100, // Search within a radius of 100 meters
                type: 'establishment', // Specify the type of places you're interested in
                key: GOOGLE_API_KEY
            }
        });

        const operationalResult = response.data.results.find(result => result.business_status === 'OPERATIONAL');
        if (operationalResult) {
            return operationalResult.name;
        } else {
            // If no operational establishments found, get the formatted address using reverse geocoding
            const reverseGeocodingResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    latlng: `${lat},${lon}`,
                    key: GOOGLE_API_KEY
                }
            });

            // Check if results are available
            if (reverseGeocodingResponse.data.results.length > 0) {
                const formattedAddress = reverseGeocodingResponse.data.results[0].formatted_address;
                // Extract street name from the formatted address if available
                const streetName = formattedAddress.split(',')[0].trim();
                
                return streetName ? streetName : formattedAddress;
            } else {
                return "Undefined Area";
            }
        }
    } catch (error) {
        console.error('Error fetching nearby buildings:', error);
        throw error;
    }
};

module.exports = {
    getNearestBuildingName
};
