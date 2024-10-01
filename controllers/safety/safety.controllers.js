const { tb_r_driver_behavior } = require("../../config/tables");
const { queryGET, queryPOST } = require("../../helpers/query");
const response = require("../../helpers/response");
const { encrypt } = require("../../helpers/security");

module.exports = {
  getHistoricalDrow: async (req, res) => {
    try {
      let queryCond = ``;
      let is_avail_query = Object.keys(req.query).length > 0;

      if (is_avail_query) {
        queryCond = " AND ";
        let containerCond = [];
        if (req.query.start_date) {
          containerCond.push(
            `created_dt BETWEEN "${req.query["start_date"]}" AND "${req.query["end_date"]}"`
          );
          delete req.query.start_date;
          delete req.query.end_date;
        }
        for (const key in req.query) {
          const value = req.query[key];
          containerCond.push(`${key} = '${value}'`);
        }
        queryCond += containerCond.join(" AND ");
      }

      let historicalDrowData = await queryGET(
        tb_r_driver_behavior,
        `WHERE 
          vehicle_id = '${req.params.vehicle_id}'
          ${queryCond}`
      );
      let mapData = await historicalDrowData.map((item) => {
        item.img_path = `http://103.190.28.211:3000/api/v1/image?path=${item.img_path}`;
        return item;
      });
      response.success(res, mapData);
    } catch (error) {
      console.log(error);
      response.error(res, "Error to get drowsiness historical");
    }
  },
};
