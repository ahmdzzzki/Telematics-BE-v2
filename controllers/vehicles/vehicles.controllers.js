const {
  tb_m_vehicle,
  tb_m_user_vehicle,
  tb_r_vehicle_status,
  tb_m_system,
  tb_r_car_service_history,
  tb_r_locations,
} = require("../../config/tables");
const response = require("../../helpers/response");

const {
  queryGET,
  queryPOST,
  queryPUT,
  queryDELETE,
  queryCustom,
} = require("../../helpers/query");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/service_information/"); // Specify the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Define allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

// Define a function to filter file types

const upload = multer({ storage: storage });
module.exports = {
  getVehicles: async (req, res) => {
    try {
      if (req.params.vin) {
        let vehicleData = await queryGET(
          tb_m_vehicle,
          `WHERE vehicle_id = '${req.params.vin}'`
        );
        response.success(res, vehicleData);
        return;
      }

      let vehicleData = await queryGET(
        tb_m_user_vehicle,
        `WHERE username = '${req.user.username}'`
      );
      response.success(res, vehicleData);
    } catch (error) {
      response.error(res, error);
    }
  },
  addVehicle: async (req, res) => {
    try {
      await queryPOST(tb_m_vehicle, req.body);
      response.success(res, "success to add vehicle");
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
  addVehicleStatus: async (req, res) => {
    try {
      console.log(req.body);
      let parseData = JSON.parse(req.body.obj_data);
      // DUMMY
      parseData.vehicle_id = 1;
      await queryPOST(tb_r_vehicle_status, parseData);
      return response.success(res, "Success to add Car Status");
      // req.body.vehicle_id = req.body.vin;
      // delete req.body.vin;
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
  getVehicleStatus: async (req, res) => {
    try {
      const { name = null, vehicle_id } = req.query;
      console.log(vehicle_id);
      let selectedCol = null;
      name ? (selectedCol = `${name}`) : null;
      const qGetLastLocation = `(SELECT CONCAT(longitude,',',latitude) AS location FROM ${tb_r_locations} WHERE vehicle_id = '${vehicle_id}' ORDER BY created_dt DESC LIMIT 1) AS location`;
      let responseData = await queryGET(tb_r_vehicle_status, `LIMIT 10`, [
        selectedCol ? selectedCol : "*",
        `${qGetLastLocation}`,
      ]);
      let mapData = {
        location: responseData[0].location,
        statistics: responseData.map((item) => {
          delete item.location;
          return item;
        }),
      };

      response.success(res, mapData);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
  submitServiceInformation: async (req, res) => {
    try {
      const uploadFile = () => {
        return new Promise((resolve, reject) => {
          upload.single("service_image")(req, res, function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      };

      // Wait for the file upload to complete
      await uploadFile();

      // Check if a file was uploaded and get its path
      let filePath = "";
      if (req.file) {
        // add hostname to file path
        filePath = `http://${req.headers.host}/${req.file.path}`;
      }

      await queryPOST(tb_r_car_service_history, {
        ...req.body,
        service_image: filePath,
      });

      return response.success(res, "Success to submit service information");
    } catch (error) {
      console.log(error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      response.error(res, error);
    }
  },

  updateServiceInformation: async (req, res) => {
    try {
      // data = await queryGET(
      //   tb_r_car_service_history,
      //   `WHERE service_id = ${req.params.service_id}`
      // )

      // if (data[0].service_image != null) {
      //   fs.unlinkSync(data[0].service_image);
      // }
      console.log("MASUK SINI BOSS");
      const uploadFile = () => {
        return new Promise((resolve, reject) => {
          upload.single("service_image")(req, res, function (err) {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      };

      // Wait for the file upload to complete
      await uploadFile();

      // Check if a file was uploaded and get its path
      let filePath = "";
      if (req.file) {
        // add hostname to file path
        filePath = `http://${req.headers.host}/${req.file.path}`;
      }

      await queryPUT(
        tb_r_car_service_history,
        { ...req.body, service_image: filePath },
        `WHERE service_id = ${req.params.service_id}`
      );

      return response.success(res, "Success to update service information");
    } catch (error) {
      console.log(error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      response.error(res, error);
    }
  },

  deleteServiceHistory: async (req, res) => {
    try {
      await queryDELETE(
        tb_r_car_service_history,
        `WHERE service_id = '${req.params.service_id}'`
      );
      response.success(res, "Success to delete service information");
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  getServiceHistory: async (req, res) => {
    try {
      let serviceHistory = await queryGET(
        tb_r_car_service_history,
        `WHERE vehicle_id = '${req.params.vin}'`
      );
      response.success(res, serviceHistory);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  getLastPartMaintenance: async (req, res) => {
    try {
      // let serviceHistory = await queryGET(
      //   tb_r_car_service_history,
      //   `WHERE vehicle_id = '${req.params.vin}'`
      // );
      var parts = [
        "oil",
        "cabin_filter",
        "engine_filter",
        "air_filter",
        "battery",
        "brake_pad",
        "brake_fluid",
        "tire_spooring",
        "tire_balancing",
        "tire_replacement",
      ];

      var listData = [];

      for (let i = 0; i < parts.length; i++) {
        var maintenanceData = {};

        let part = parts[i];
        let serviceHistory = await queryGET(
          tb_r_car_service_history,
          `WHERE vehicle_id = '${req.params.vin}' AND part_list_code LIKE '%${part}%' ORDER BY maintenance_date DESC LIMIT 1`
        );
        if (serviceHistory.length > 0) {
          maintenanceData["name"] = part;
          maintenanceData["odometer"] = serviceHistory[0].odometer;
          maintenanceData["maintenance_date"] =
            serviceHistory[0].maintenance_date;
          listData.push(maintenanceData);
        }
      }

      response.success(res, listData);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  getLatestOdoMeter: async (req, res) => {
    try {
      const { vehicle_id } = req.query
      let data = await queryGET(
        tb_r_vehicle_status,
        `WHERE vehicle_id = '${vehicle_id}' ORDER BY created_dt DESC LIMIT 1`,
        ["odometer"]
      );
      console.log(data)
      response.success(res, data[0]);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  }
};
