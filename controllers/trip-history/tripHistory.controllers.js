const { tb_r_trip_history } = require("../../config/tables");
const { queryGET, queryPOST, queryPUT } = require("../../helpers/query");
const response = require("../../helpers/response");

module.exports = {
    addTripHistory: async (req, res) => {
        try {
            await queryPOST(tb_r_trip_history, req.body);
            response.success(res, "success to add trip history");

        } catch (error) {
            console.log(error);
            response.error(res, "Error go add trip history");
        }
    },

    getTripHistoryByTripId: async (req, res) => {
        try {
            const vehicleId = req.params.vehicle_id;
            const tripId = req.params.trip_id;
    
            const query = await queryGET(tb_r_trip_history, `WHERE vehicle_id = '${vehicleId}' AND trip_id = '${tripId}'`);
            
            response.success(res, query);
        } catch (error) {
            console.log(error);
            response.error(res, "Error getting trip history by vehicle_id and trip_id");
        }
    },

    getTripHistoryByVin: async (req, res) => {
        try {
            const vehicleId = req.params.vehicle_id;
    
            const query = await queryGET('tb_r_trip_history', `WHERE vehicle_id = '${vehicleId}'`);
            
            response.success(res, query);
        } catch (error) {
            console.log(error);
            response.error(res, "Error getting trip history by vin");
        }
    }
};
