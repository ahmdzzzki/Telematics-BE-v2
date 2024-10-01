const table = require("../../config/tables");
const { queryGET, queryPOST, queryPUT, queryPUTForceValue } = require("../../helpers/query");
const response = require("../../helpers/response");
const { getDistanceBetweenTwoPoints } = require("../../helpers/distance_helper");
const { getNearestBuildingName } = require("../../helpers/get_nearest_building");

module.exports = {
    addTripHistory: async (req, res) => {
        try {
            const { vehicle_id, trip_id, longitude, latitude, is_end_trip } = req.body;
            const currentCoordinates = `${longitude},${latitude}`;

            // Check if the trip ID already exists in tb_r_trip_history
            const tripExists = await queryGET(table.tb_r_trip_history, `WHERE trip_id = '${trip_id}' LIMIT 1`);
            if (tripExists && tripExists.length > 0) {
                // Trip ID already exists, update the existing record
                const whereExists = `WHERE trip_id = '${trip_id}' and vehicle_id = '${vehicle_id}' ORDER BY created_dt DESC LIMIT 1`;
                const lastLocation = await queryGET(table.tb_r_locations, whereExists);
                if (lastLocation && lastLocation.length > 0) {
                    // Calculate the distance between the last location and the new location
                    const lastTripDistance = tripExists[0].distance;
                    const distance = getDistanceBetweenTwoPoints(
                        { lat: lastLocation[0].latitude, lon: lastLocation[0].longitude },
                        { lat: latitude, lon: longitude }
                    );

                    const newDistance = (lastTripDistance || 0.0) + distance;

                    await queryPUTForceValue(
                        table.tb_r_trip_history,
                        { distance: newDistance },
                        whereExists
                    );

                    if (is_end_trip === '1') {
                        // Calculate fuel consumed, trip duration, average speed, and carbon emissions
                        const tripHistory = await queryGET(table.tb_r_trip_history, whereExists);
                        if (tripHistory && tripHistory.length > 0) {
                            const fuelConsumed = tripHistory[0].distance / 20.9;
                            const tripStartTime = await queryGET(table.tb_r_locations, `WHERE trip_id = '${trip_id}' and vehicle_id = '${vehicle_id}' and is_end_trip = '0' ORDER BY created_dt ASC LIMIT 1`);
                            const tripEndTime = new Date();
                            tripEndTime.setMinutes(tripEndTime.getMinutes() - 30);
                            const tripDuration = (tripEndTime - new Date(tripStartTime[0].created_dt)) / (1000 * 60 * 60);
                            const totalDistance = tripHistory[0].distance;
                            const avgSpeed = totalDistance / tripDuration;
                            const emissionFactor = 2.3;
                            const carbonEmissionPerKm = fuelConsumed * emissionFactor;

                            const listLocation = `${tripHistory[0].next_locations};${longitude},${latitude}`;
                            const locationNames = await Promise.all(listLocation.split(';').map(async (coord) => {
                                const [lon, lat] = coord.split(',');
                                return await getNearestBuildingName(lat, lon);
                                // return await reverseGeocode(lat, lon);
                            }));
                            const firstLocation = locationNames.join(';');

                            await queryPUT(
                                table.tb_r_trip_history,
                                {
                                    fuel_consumed: fuelConsumed,
                                    duration: tripDuration,
                                    avg_speed: avgSpeed,
                                    carbon_emission: carbonEmissionPerKm,
                                    last_location: currentCoordinates,
                                    first_location: firstLocation,
                                },
                                whereExists
                            );

                            // Extracting hour and minute from each created_dt and updating time_list
                            timeList = [];
                            // Add time of each location
                            let allStop = await queryGET(table.tb_r_locations, `WHERE trip_id = '${trip_id}' and vehicle_id = '${vehicle_id}' and is_end_trip = '0' ORDER BY created_dt ASC`);
                            
                            allStop.forEach(location => {
                                const createdDate = new Date(location.created_dt);
                                const hour = ('0' + createdDate.getHours()).slice(-2);
                                const minute = ('0' + createdDate.getMinutes()).slice(-2);
                                timeList.push(`${hour}:${minute}`);
                            });

                            console.log("timeList",timeList);
                            const currentTime = new Date();
                            currentTime.setMinutes(currentTime.getMinutes() - 30);
                            const lastLoctHour = ('0' + currentTime.getHours()).slice(-2);
                            const lastLocMinute = ('0' + currentTime.getMinutes()).slice(-2);
                            timeList.push(`${lastLoctHour}:${lastLocMinute}`);

                            console.log("timeList", timeList);
                            const formattedTimeList = timeList.join(';');

                            // Update time_list with formatted time list
                            await queryPUT(
                                table.tb_r_trip_history,
                                { time_list: formattedTimeList },
                                whereExists
                            );
                        }
                    } else {
                        const nextLocation = await queryGET(table.tb_r_trip_history, whereExists);
                        let updatedNextLocation = currentCoordinates;
                        if (nextLocation && nextLocation.length > 0) {
                            updatedNextLocation = `${nextLocation[0].next_locations};${updatedNextLocation}`;
                        }
                        await queryPUT(table.tb_r_trip_history, { next_locations: updatedNextLocation }, whereExists);
                    }
                }
            } else {
                // Trip ID doesn't exist, insert a new record
                const queryData = {
                    trip_id,
                    distance: 0,
                    avg_speed: req.body.avg_speed ?? 0,
                    fuel_consumed: req.body.fuel_consumed ?? 0,
                    vehicle_id: req.body.vehicle_id ?? '1HBGH1J787E',
                    next_locations: currentCoordinates,
                };
                await queryPOST(table.tb_r_trip_history, queryData);
            }

            if (is_end_trip === '1') {
                const currentTime = new Date();
                const thirtyMinutesAgo = new Date(currentTime.getTime() - (30 * 60 * 1000));

                function formatDateToMySQL(date) {
                    const year = date.getFullYear();
                    const month = ('0' + (date.getMonth() + 1)).slice(-2);
                    const day = ('0' + date.getDate()).slice(-2);
                    const hours = ('0' + date.getHours()).slice(-2);
                    const minutes = ('0' + date.getMinutes()).slice(-2);
                    const seconds = ('0' + date.getSeconds()).slice(-2);
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }

                const formattedDate = formatDateToMySQL(thirtyMinutesAgo);

                const queryData2 = {
                    trip_id,
                    longitude,
                    latitude,
                    vehicle_id,
                    is_end_trip,
                    // created_dt: formattedDate,
                };

                await queryPOST(table.tb_r_locations, queryData2);
            } else if (is_end_trip === '0') {
                const currentTime = new Date();
                const threeMinutesAgo = new Date(currentTime.getTime() - (3 * 60 * 1000));

                function formatDateToMySQL(date) {
                    const year = date.getFullYear();
                    const month = ('0' + (date.getMonth() + 1)).slice(-2);
                    const day = ('0' + date.getDate()).slice(-2);
                    const hours = ('0' + date.getHours()).slice(-2);
                    const minutes = ('0' + date.getMinutes()).slice(-2);
                    const seconds = ('0' + date.getSeconds()).slice(-2);
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }

                const formattedDate = formatDateToMySQL(threeMinutesAgo);

                const queryData3 = {
                    trip_id,
                    longitude,
                    latitude,
                    vehicle_id,
                    is_end_trip,
                    // created_dt: formattedDate,
                };
                // Add the new location to tb_r_locations
                await queryPOST(table.tb_r_locations, queryData3);
            } else {
                await queryPOST(table.tb_r_locations, req.body);
            }
            response.success(res, "Successfully added trip location");
        } catch (error) {
            console.log('error addtrip', error);
            response.error(res, "Error adding trip history");
        }
    },

    getTripHistory: async (req, res) => {
        try {
            if (req.params.trip_id != null) {
                var query = await queryGET(table.tb_r_locations, `WHERE trip_id = ${req.params.trip_id}`);

            } else {
                var vehicle_id = req.query.vehicle_id;

                var query = await queryGET(table.tb_r_locations, `WHERE vehicle_id = '${vehicle_id}' ORDER BY trip_id DESC`);
            }
            response.success(res, query);

        } catch (error) {
            console.log(error);
            response.error(res, "Error get trip history");
        }
    },

    getLatestTripId: async (req, res) => {
        try {
            const { vehicle_id } = req.query;

            // Check if vehicle_id is provided
            if (!vehicle_id) {
                return response.error(res, "Vehicle ID is required");
            }

            // Fetch the latest trip record for the given vehicle ID
            const latestTrip = await queryGET(table.tb_r_locations, `WHERE vehicle_id = '${vehicle_id}' ORDER BY created_dt DESC LIMIT 1`);

            // If there is no trip record for the given vehicle ID, return null
            const latestTripId = latestTrip[0] ? latestTrip[0].trip_id : null;

            response.success(res, { latest_trip_id: latestTripId });
        } catch (error) {
            console.log(error);
            response.error(res, "Error fetching latest trip ID");
        }
    },
    
    getLatestLocationByVin: async (req, res) => {
        try {
            const vehicleId = req.params.vehicle_id;
    
            const query = await queryGET('tb_r_locations', `WHERE vehicle_id = '${vehicleId}' ORDER BY location_id DESC LIMIT 1`);
            
            response.success(res, query);
        } catch (error) {
            console.log(error);
            response.error(res, "Error getting latest trip location by vin");
        }
    },
};