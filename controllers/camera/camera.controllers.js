const { tb_r_ip_camera } = require("../../config/tables");
const { queryGET, queryPOST, queryPUT } = require("../../helpers/query");
const response = require("../../helpers/response");

module.exports = {
    addCamera: async (req, res) => {
        try {
            await queryPOST(tb_r_ip_camera, req.body);
            response.success(res, "Success to adding camera ip");

        } catch (error) {
            console.log(error);
            response.error(res, "Error adding camera ip");
        }
    },

    getCameraByVin: async (req, res) => {
        try {
            const vehicleId = req.params.vehicle_id;
    
            const query = await queryGET('tb_r_ip_camera', `WHERE vehicle_id = '${vehicleId}' ORDER BY created_dt DESC LIMIT 1`);
            
            response.success(res, query);
        } catch (error) {
            console.log(error);
            response.error(res, "Error getting camera by vin");
        }
    }
};