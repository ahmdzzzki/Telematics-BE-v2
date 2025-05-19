const {
  tb_m_user_vehicle,
  tb_m_users,
  tb_m_vehicle,
  tb_m_visitor,
  tb_r_visitor_activity,
  tb_m_key_access
} = require("../../config/tables");
const { queryGET, queryPOST, queryCustom } = require("../../helpers/query");
const response = require("../../helpers/response");
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

module.exports = {
  userVehicleInfo: async (req, res) => {
    try {
      console.log(req.params.username);
      let q = `
      SELECT
        *
      FROM ${tb_m_user_vehicle} tmuv
      JOIN ${tb_m_vehicle} tmv ON tmv.vehicle_id = tmuv.user_vehicle_id
      WHERE username = '${req.user.username}'`;
      let vehicles = await queryCustom(q);
      let resObj = {
        user: req.user.username,
        vehicles,
      };
      response.success(res, resObj);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  connectVehicle: async (req, res) => {
    try {
      console.log(req.user);
      let q = `SELECT * FROM ${tb_m_vehicle} WHERE vehicle_id = '${req.body.vehicle_id}' AND username = '${req.user.username}'`;
      if (q[0] != null) {
        response.success(res, "vehicle already connected");
      } else {
        let insertedData = {
          username: req.user.username,
          vehicle_id: req.body.vehicle_id,
          created_by: req.user.username,
        };
        await queryPOST(tb_m_user_vehicle, insertedData);
        response.success(res, "Success to connect vehicle");
      }
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },


  getVisitorByVehicleId: async(req,res) => {
    try {
      const {vehicle_id} = req.params;
      // Query untuk mengambil semua data dari tabel tb_r_visitor_activity
      const query = `SELECT * from ${tb_m_visitor} where vehicle_id = '${vehicle_id}' ORDER BY create_dt DESC`;

      // Menjalankan query menggunakan fungsi queryCustom
      const visitors = await queryCustom(query);

     

      // Mengirimkan respons sukses dengan data aktivitas pengunjung
      response.success(res, visitors,);
  } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
  }
  },

  registerVisitor: async (req, res) => {  
    try {  
        const {  visitor_name, vin} = req.body;  

        // Validate input  
        if ( !visitor_name || !vin) {  
            return response.error(res, "Visitor name and VIN are required", 400);  
        }  

   
        const vehicle = await queryGET(tb_m_vehicle,`WHERE vehicle_identification_number = '${vin}'`);  

        if (vehicle.length <= 0) {  
            return response.error(res, "Vehicle not found", 409);  
        }  

        const vehicle_id = vehicle[0].vehicle_id;  

             // Check apakah visitor dengan nama sama sudah ada untuk kendaraan ini   
             const checkQuery = `
              SELECT * FROM ${tb_m_visitor}
              WHERE visitor_name = '${visitor_name}' AND vehicle_id = '${vehicle_id}'`;  
             const existingVisitor = await queryCustom(checkQuery);  
     
             if (existingVisitor.length > 0) {  
                 return response.error(res, "Visitor already exists", 409);  
             }  
     

        // Generate UUID for visitor_id  
        const id = uuidv4();  

        // Insert visitor data with the generated visitor_id  
        const visitorData = {  visitor_name, vehicle_id, id};  
        await queryPOST(tb_m_visitor, visitorData);  
        let resObj = {
          visitor_id : id,
        };
        // Return response with visitor_id  
        response.success(res,  resObj);  
    } catch (error) {  
        console.error(error);  
        response.error(res, "Internal server error");  
    }  
},

  /* registerVisitor: async (req, res) => {  
    try {  

        const {  visitor_name, vin ,type} = req.body;  

        // Validate input  
        if ( !visitor_name || !vin || !type) {  
            return response.error(res, "Key Access and Visitor Name are required", 400);  
        }  

   
        const vehicle = await queryGET(tb_m_vehicle,`WHERE vehicle_identification_number = '${vin}'`);  

        if (vehicle.length <= 0) {  
            return response.error(res, "Vehicle not found", 409);  
        }  

        const vehicle_id = vehicle[0].vehicle_id;  

             // Check if key_access already exists  
             const checkQuery = `SELECT * FROM ${tb_m_visitor} WHERE visitor_name = '${visitor_name}' AND vehicle_id = '${vehicle_id}' AND type = '${type}'`;  
             const existingVisitor = await queryCustom(checkQuery);  
     
             if (existingVisitor.length > 0) {  
                 return response.error(res, "Visitor already exists", 409);  
             }  
     

        // Generate UUID for visitor_id  
        const id = uuidv4();  

        // Insert visitor data with the generated visitor_id  
        const visitorData = {  visitor_name, vehicle_id, id ,type};  
        await queryPOST(tb_m_visitor, visitorData);  
        let resObj = {
          visitor_id : id,
        };
        // Return response with visitor_id  
        response.success(res,  resObj);  
    } catch (error) {  
        console.error(error);  
        response.error(res, "Internal server error");  
    }  
}, */
  
  deleteVisitor: async (req, res) => {  
    try {  
      const { visitor_id } = req.params; // Access key_access from the request body  
      
      // Validate input  
      if (!visitor_id) {  
        return response.error(res, "Visitor ID is required", 400);  
      }  

      // const vehicle = await queryGET(tb_m_vehicle,`WHERE vehicle_identification_number = '${vin}'`);  
  
      // if (vehicle.length <= 0) {  
      //   return response.error(res, "Vehicle not found", 409);  
      // }  

  
      // Check if key_access exists  
      const checkQuery = `SELECT * FROM ${tb_m_visitor} WHERE id = '${visitor_id}'`;  
      const existingVisitor = await queryCustom(checkQuery);  
  
      if (existingVisitor.length === 0) {  
        return response.error(res, "Visitor not found", 404);  
      }  
  
      // Delete visitor data  
      const deleteQuery = `DELETE FROM ${tb_m_visitor} WHERE id = '${visitor_id}'`;  
      await queryCustom(deleteQuery);  
  
      response.success(res, "Visitor deleted successfully");  
    } catch (error) {  
      console.error(error);  
      response.error(res, "Internal server error");  
    }  
  },

  recordVisitorActivity: async (req, res) => {  
    try {  
      const { visitor_id } = req.body; // Access data from the request body  
  
      // Validate input  
      if (!visitor_id) {  
        return response.error(res, "Visitor ID is required", 400);  
      }  

  
      // Check if key_access exists  
      const checkQuery = `SELECT * FROM ${tb_m_visitor} WHERE id = '${visitor_id}'`;  
      const existingVisitor = await queryCustom(checkQuery);  
  
      if (existingVisitor.length === 0) {  
        return response.error(res, "Visitor not found", 404);  
      }  
  
      // Insert visitor activity  
      const activityData = {  
        visitor_id,  
        
      };  
      await queryPOST(tb_r_visitor_activity, activityData);  
  
      response.success(res, "Visitor activity recorded successfully");  
    } catch (error) {  
      console.error(error);  
      response.error(res, "Internal server error");  
    } 
  },

  getRecordVisitorActivity : async (req, res) => {
    try {
        const {visitor_id} = req.params;
        // Query untuk mengambil semua data dari tabel tb_r_visitor_activity
        const query = `SELECT * FROM ${tb_r_visitor_activity} where visitor_id = '${visitor_id}' order by created_at desc`;

        // Menjalankan query menggunakan fungsi queryCustom
        const visitorActivities = await queryCustom(query);

        // Jika tidak ada data yang ditemukan
        if (visitorActivities.length === 0) {
            return response.error(res, "No visitor activity records found", 404);
        }

        // Mengirimkan respons sukses dengan data aktivitas pengunjung
        response.success(res, visitorActivities);
    } catch (error) {
        console.error(error);
        response.error(res, "Internal server error");
    }
  },

  /* editVisitor: async (req, res) => {  
    try {  
      const { key_access, new_visitor_name } = req.body; // Access data from the request body  
  
      // Validate input  
      if (!new_visitor_name) {  
        return response.error(res, "Visitor name is required", 400);  
      }  
  
      let updateQuery = `UPDATE ${tb_m_visitor} SET visitor_name = '${new_visitor_name}' WHERE key_access = '${key_access}'`;  
      let result = await queryCustom(updateQuery);  
  
      if (result.affectedRows > 0) {  
        response.success(res, "Visitor name updated successfully");  
      } else {  
        response.error(res, "Failed to update visitor name");  
      }  
    } catch (error) {  
      console.error(error);  
      response.error(res, "Internal server error");  
    }  
  },*/

  editVisitor: async (req, res) => {  
    try {  
      const { visitor_id, new_visitor_name } = req.body;  
    
      if (!visitor_id || !new_visitor_name) {  
        return response.error(res, "Visitor ID and new name are required", 400);  
      }  
    
      const updateQuery = `UPDATE ${tb_m_visitor} SET visitor_name = '${new_visitor_name}' WHERE id = '${visitor_id}'`;  
      const result = await queryCustom(updateQuery);  
    
      if (result.affectedRows > 0) {  
        response.success(res, "Visitor name updated successfully");  
      } else {  
        response.error(res, "Visitor not found or name not changed");  
      }  
    } catch (error) {  
      console.error(error);  
      response.error(res, "Internal server error");  
    }  
  },
  
  /*
  insertKeyAccess: async (req, res) => {
    try {
      const { visitor_id, type } = req.body;
  
      if (!visitor_id || !type) {
        return response.error(res, "Visitor ID and type are required", 400);
      }
  
      const keyData = {
        visitor_id,
        type,
      };
  
      await queryPOST(tb_m_key_access, keyData);
  
      response.success(res, "Key access created successfully");
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  },
  */

  registerVisitorKeyAccesstoDB: async (req, res) => {
    try {
      const { id, visitor_id, type } = req.body;
  
      if (!id || !visitor_id || !type) {
        return response.error(res, "Key Access ID, Visitor ID, and Type are required", 400);
      }

      const createdAt = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
  
      // 1. Insert key access ke tb_m_key_access
      const keyAccessData = {
        id,
        visitor_id,
        type,
        // created_at: new Date(),
        created_at: createdAt
      };
  
      await queryPOST(tb_m_key_access, keyAccessData);
  
      // 2. Update field type di tb_m_visitor
      const updateVisitorQuery = `
        UPDATE ${tb_m_visitor}
        SET type = '${type}'
        WHERE id = '${visitor_id}'
      `;
      await queryCustom(updateVisitorQuery);
  
      response.success(res, {
        message: "Key access saved and visitor type updated",
        key_access_id: id,
      });
  
    } catch (error) {
      console.error(error);
      response.error(res, "Failed to save key access");
    }
  },  

  /*
  getKeyByVisitorId: async (req, res) => {
    try {
      const { visitor_id } = req.params;
  
      if (!visitor_id) {
        return response.error(res, "Visitor ID is required", 400);
      }
  
      const query = `SELECT * FROM ${tb_m_key_access} WHERE visitor_id = '${visitor_id}' ORDER BY created_at DESC`;
      const keys = await queryCustom(query);
  
      response.success(res, keys);
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  },
  */
  
  
  deleteKeyById: async (req, res) => {
    try {
      const { key_id } = req.params;
  
      if (!key_id) {
        return response.error(res, "Key ID is required", 400);
      }
  
      // Cek apakah key access ada
      const check = `SELECT * FROM ${tb_m_key_access} WHERE id = '${key_id}'`;
      const existing = await queryCustom(check);
  
      if (existing.length === 0) {
        return response.error(res, "Key not found", 404);
      }
  
      // Hapus key access
      const del = `DELETE FROM ${tb_m_key_access} WHERE id = '${key_id}'`;
      await queryCustom(del);
  
      response.success(res, "Key deleted successfully");
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  },
  
  deleteVisitorByName: async (req, res) => {
    try {
      const { visitor_name } = req.params;
  
      if (!visitor_name) {
        return response.error(res, "Visitor name is required", 400);
      }
  
      // Cek apakah visitor ada
      const visitorQuery = `SELECT * FROM ${tb_m_visitor} WHERE visitor_name = '${visitor_name}'`;
      const visitors = await queryCustom(visitorQuery);
  
      if (visitors.length === 0) {
        return response.error(res, "Visitor not found", 404);
      }
  
      // Hapus semua key_access berdasarkan visitor_id
      for (const visitor of visitors) {
        const deleteKeyQuery = `DELETE FROM ${tb_m_key_access} WHERE visitor_id = '${visitor.id}'`;
        await queryCustom(deleteKeyQuery);
      }
  
      // Hapus semua visitor berdasarkan nama
      const deleteVisitorQuery = `DELETE FROM ${tb_m_visitor} WHERE visitor_name = '${visitor_name}'`;
      await queryCustom(deleteVisitorQuery);
  
      response.success(res, "Visitor and all access deleted successfully");
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  }
  
  
};
