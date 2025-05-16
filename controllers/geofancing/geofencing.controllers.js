const { tb_r_geofencing } = require("../../config/tables");
const { queryGET, queryPOST, queryPUT, queryDELETE, queryCustom } = require("../../helpers/query");
const response = require("../../helpers/response");
const { wssGeofencing } = require("../../server");

module.exports = {
  addFencingArea: async (req, res) => {
    try {
      const roundCoordinates = (coordinates) => {
        return coordinates.map(coordinate => {
          const [lat, long] = coordinate.split(',');
          const roundedLat = parseFloat(lat).toFixed(6);
          const roundedLong = parseFloat(long).toFixed(6);
          return `${roundedLat},${roundedLong}`;
        });
      };
      req.body.geo_locations = roundCoordinates(req.body.geo_locations.split(';')).join(';');

      await queryPOST(tb_r_geofencing, req.body);
      var list = await queryGET(tb_r_geofencing, `WHERE vehicle_id = '${req.body.vehicle_id}' AND status = 1`);
      if (list.length > 0) {
        wssGeofencing.clients.forEach(client => {
          if (client.id.vehicle_id == req.body.vehicle_id && client.id.device == 'GPS') {
            client.send(JSON.stringify({
              event: 'update_geofencing',
              // data: list[0]
              data: [list[0]]
            }));
          }
        })
      }
      response.success(res, "success to add fencing area");
    } catch (error) {
      // Log any errors
      console.error("Error adding fencing area:", error);
      response.error(res, "Error go add fencing area");
    }
  },



  getFencingArea: async (req, res) => {
    try {

      var id = req.query.vehicle_id;
      var devices = req.query.device;
      if (devices == 'GPS') {
        var query = await queryGET(tb_r_geofencing, `WHERE vehicle_id = '${id}' AND status = 1`);
      } else {
        var query = await queryGET(tb_r_geofencing, `WHERE vehicle_id = '${id}' ORDER BY geo_id DESC`);
      }
      response.success(res, query);
    } catch (error) {
      console.log(error);
      response.error(res, "Error go add fencing area");
    }
  },

  updateFencingArea: async (req, res) => {
    try {

      var id = req.params.geo_id;
      console.log(req.body);
      if (req.body.status == 1) {
        var q = `UPDATE ${tb_r_geofencing} SET status = 0 WHERE vehicle_id = '${req.body.vehicle_id}'`;
        await queryCustom(q);
      }
      var query = await queryPUT(tb_r_geofencing, req.body, `WHERE geo_id = ${id}`);
      var list = await queryGET(tb_r_geofencing, `WHERE vehicle_id = '${req.body.vehicle_id}' AND status = 1`);
      if (list.length > 0) {
        wssGeofencing.clients.forEach(client => {
          if (client.id.vehicle_id == req.body.vehicle_id && client.id.device == 'GPS') {
            client.send(JSON.stringify({
              event: 'update_geofencing',
              // data: list[0]
              data: [list[0]]
            }));
          }
        })
      }



      response.success(res, query);
    } catch (error) {
      console.log(error);
      response.error(res, "Error go add fencing area");
    }
  },

  deleteFencingArea: async (req, res) => {
    try {
      var id = req.params.geo_id;
      var query = await queryDELETE(tb_r_geofencing, `WHERE geo_id = ${id}`);
      response.success(res, query);
    } catch (error) {
      console.log(error);
      response.error(res, "Error go add fencing area");
    }
  }


};
