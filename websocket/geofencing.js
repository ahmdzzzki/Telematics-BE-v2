
const { tb_r_geofencing } = require("../../config/tables");
const { queryGET, queryPOST, queryPUT, queryDELETE } = require("../../helpers/query");
const response = require("../../helpers/response");

module.exports = {
    updateGeofencing: async (wss, data) => {
        try {
            wss.clients.forEach(async client => {
                if (client.id.vehicle_id == data.vehicle_id && client.id.device == 'GPS') {
                    var query = await queryGET(tb_r_geofencing, `WHERE vehicle_id = '${id}' AND status = 1`);
                    client.send(JSON.stringify({
                        event: 'update_geofencing',
                        data: query[0]
                    }));
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
}