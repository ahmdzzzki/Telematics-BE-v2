var express = require("express");
var fs = require("fs");
var app = express();
const path = require('path');
const http = require("http");
const server = http.createServer(app);
const WebSocket = require("ws");
const wsGlobal = new WebSocket.Server({ noServer: true });
const wsGeofencing = new WebSocket.Server({ noServer: true });
const wsHealthReport = new WebSocket.Server({noServer:true});
const url = require("url");
const { converBase64ToImage } = require("convert-base64-to-image");
const { queryPOST, queryGET, queryCustom } = require("./helpers/query");
const {
  tb_r_driver_behavior,
  tb_r_vehicle_status,
} = require("./config/tables");

async function insertedDataVehStats(data) {
  // data["vehicle_id"] = data["VIN"];
  data['vehicle_id'] = '1HGCM82633A123456'
  delete data["VIN"];
  data["oiltemp"] = data["oiltemp."];
  delete data["oiltemp."];
  const responseData = await queryGET(tb_r_vehicle_status, "LIMIT 1");
  if(responseData.length > 0) {

  }
  const existObjKeys = Object.keys(responseData[0]);
  const commingObjKeys = Object.keys(data);

  let columnDoesntExist = commingObjKeys.filter(
    (item) => {
      console.log(item);
      !existObjKeys.includes(item)
    }
  );

  let qAlterTable = "";
  if (columnDoesntExist.length > 0) {
    qAlterTable = `ALTER TABLE ${tb_r_vehicle_status} ${columnDoesntExist
      .map((item) => `ADD COLUMN ${item} VARCHAR(10) DEFAULT NULL`)
      .join(",")};`;
    await queryCustom(`${qAlterTable}`);
  }
  const dataValues = Object.values(data);
  const qInsertData = `INSERT INTO ${tb_r_vehicle_status} (${commingObjKeys.join(
    ","
  )}) VALUES ('${dataValues.join("','")}')`;
  console.log(`INSERT INTO ${tb_r_vehicle_status} (${commingObjKeys.join(
    ","
  )}) VALUES ('${dataValues.join("','")}')`);
  await queryCustom(`${qInsertData}`);
}

async function updateVOCHealthReport(data) {
  console.log("update data ",data);
}

wsGlobal.on("connection", function connection(ws, request) {
  console.log(
    "Connected :    " +
      request.socket.remoteAddress +
      ":" +
      request.socket.remotePort
  );
  const query = url.parse(request.url, true).query;
  query.vehicle_id = query.vehicle_id
  const jsonData = {
    vehicle_id: query.vehicle_id,
    device: query.device,
  };

  ws.id = jsonData;
  ws.send(
    JSON.stringify({
      message: "Connected",
      data: {
        identifier: ws.id,
      },
    })
  );

  ws.on("message", async function incoming(message) {
    if(message) {
      var data = JSON.parse(message);
    // console.log(data.event);
    console.log('MESSAGE DATA');
    console.log(data);
    if (`${data.data}`.includes('{"')) {
      const parseDat = JSON.parse(data.data);
      parseDat["VIN"] = data.vehicle_id;
      await insertedDataVehStats(parseDat);
    }

    switch (data.event) {
      case "UPLOAD_IMAGE":
        const cleanedBase64 = data.data.image.replace(/^b'|^b"|\'$|\"$/g, '');

        const isJpeg = cleanedBase64.startsWith('/9j/');
        const extension = isJpeg ? 'jpg' : 'png';
        const base64 = `data:image/${extension};base64,${cleanedBase64}`;
        const pathToSaveImage = `./uploads/drowsinessHistories/drow_${Date.now()}.${extension}`;        

        // const base64 = `data:image/png;base64,${data.data.image}`;
        // DUMMY
        let insertedData = {
          vehicle_id: query.vehicle_id,
          trip_id: 1,
          type_id: 1, //
          location_id: 1,
          behavior_type: data.data.behavior_type,
          img_path: pathToSaveImage,
        };
        await queryPOST(tb_r_driver_behavior, insertedData);
        converBase64ToImage(base64, pathToSaveImage);
        wsGlobal.clients.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN &&
            client.id.vehicle_id === query.vehicle_id
          ) {
            client.send(
              JSON.stringify({
                event: "STREAM_IMAGE",
                data: {
                  // image: base64,
                  image: base64.replace(/^data:image\/\w+;base64,/, ""),
                  message: "Real-time image stream"
                }
              })
            );
          }
        });
        break;
      default:
        console.log("Nothing to Do!");
        break;
    }
    wsGlobal.clients.forEach(async (client) => {
      if (
        client.id.vehicle_id == ws.id.vehicle_id &&
        client.id.device == data.target
      ) {
        wsGlobal.clients.forEach((client) => {
          if (
            client.id.vehicle_id == ws.id.vehicle_id &&
            client.id.device == data.target
          ) {
            switch (data.event) {
              default:
                client.send(JSON.stringify(data));
            }
          }
        });
      }
    });
    }
  });

  // // on disconnect
  ws.on("close", function close() {
    console.log(
      "Disconnected :    " +
        request.socket.remoteAddress +
        ":" +
        request.socket.remotePort
    );
    const query = url.parse(request.url, true).query;

    const jsonData = {
      vehicle_id: query.vehicle_id,
      device: query.device,
    };

    ws.id = jsonData;
    ws.send(
      JSON.stringify({
        message: "Connected",
        data: {
          identifier: ws.id,
        },
      })
    );
  });
});

wsGeofencing.on("connection", function connection(ws, request) {
  console.log(
    "Connected :    " +
      request.socket.remoteAddress +
      ":" +
      request.socket.remotePort
  );
  const query = url.parse(request.url, true).query;

  const jsonData = {
    vehicle_id: query.vehicle_id,
    device: query.device,
  };

  ws.id = jsonData;
  ws.send(
    JSON.stringify({
      message: "Connected",
      data: {
        identifier: ws.id,
      },
    })
  );

  ws.on("message", async function incoming(message) {
    var data = JSON.parse(message);
    console.log(data.event);

    if (data.CalculatedEngineLoad || data.rpm) {
      await insertedDataVehStats(data);
    }

    switch (data.event) {
      case "UPLOAD_IMAGE":

        const cleanedBase64 = data.data.image.replace(/^b'|^b"|\'$|\"$/g, '');

        const isJpeg = cleanedBase64.startsWith('/9j/');
        const extension = isJpeg ? 'jpg' : 'png';
        const base64 = `data:image/${extension};base64,${cleanedBase64}`;
        const pathToSaveImage = `./uploads/drowsinessHistories/drow_${Date.now()}.${extension}`;
      
        // const base64 = `data:image/png;base64,${data.data.image}`;
        // DUMMY
        let insertedData = {
          vehicle_id: query.vehicle_id,
          trip_id: 1,
          type_id: 1, //
          location_id: 1,
          behavior_type: data.data.behavior_type,
          img_path: pathToSaveImage,
          ear: data.data.ear,
          mar: data.data.mar,
        };
        await queryPOST(tb_r_driver_behavior, insertedData);
        converBase64ToImage(base64, pathToSaveImage);
        wsGlobal.clients.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN &&
            client.id.vehicle_id === query.vehicle_id
          ) {
            client.send(
              JSON.stringify({
                event: "STREAM_IMAGE",
                data: {
                  // image: base64,
                  image: base64.replace(/^data:image\/\w+;base64,/, ""),
                  message: "Real-time image stream"
                }
              })
            );
          }
        });
        break;
      default:
        console.log("Nothing to Do!");
        break;
    }
    wsGeofencing.clients.forEach(async (client) => {
      if (
        client.id.vehicle_id == ws.id.vehicle_id &&
        client.id.device == data.target
      ) {
        wsGeofencing.clients.forEach((client) => {
          if (
            client.id.vehicle_id == ws.id.vehicle_id &&
            client.id.device == data.target
          ) {
            switch (data.event) {
              default:
                client.send(JSON.stringify(data));
            }
          }
        });
      }
    });
  });

  // // on disconnect
  ws.on("close", function close() {
    console.log(
      "Disconnected :    " +
        request.socket.remoteAddress +
        ":" +
        request.socket.remotePort
    );
    const query = url.parse(request.url, true).query;

    const jsonData = {
      vehicle_id: query.vehicle_id,
      device: query.device,
    };

    ws.id = jsonData;
    ws.send(
      JSON.stringify({
        message: "Connected",
        data: {
          identifier: ws.id,
        },
      })
    );
  });
});

wsHealthReport.on("connection", function connection(ws, request) {
  console.log(
    "Connected :    " +
      request.socket.remoteAddress +
      ":" +
      request.socket.remotePort
  );
  const query = url.parse(request.url, true).query;

  const jsonData = {
    vehicle_id: query.vehicle_id,
    device: query.device,
  };

  ws.id = jsonData;
  ws.send(
    JSON.stringify({
      message: "Connected",
      data: {
        identifier: ws.id,
      },
    })
  );

  ws.on("message", async function incoming(message) {
    var data = JSON.parse(message);
    console.log(data.event);

    if (data.voc) {
      await updateVOCHealthReport(data);
    }
    wsHealthReport.clients.forEach(async (client) => {
      if (
        client.id.vehicle_id == ws.id.vehicle_id &&
        client.id.device == data.target
      ) {
        wsHealthReport.clients.forEach((client) => {
          if (
            client.id.vehicle_id == ws.id.vehicle_id &&
            client.id.device == data.target
          ) {
            switch (data.event) {
              default:
                client.send(JSON.stringify({
                  mesage:"balasan",
                  req:request.socket.remoteAddress + ":" +request.socket.remotePort
                }));
            }
          }
        });
      }
    });
  });

  // // on disconnect
  ws.on("close", function close() {
    console.log(
      "Disconnected :    " +
        request.socket.remoteAddress +
        ":" +
        request.socket.remotePort
    );
    const query = url.parse(request.url, true).query;

    const jsonData = {
      vehicle_id: query.vehicle_id,
      device: query.device,
    };

    ws.id = jsonData;
    ws.send(
      JSON.stringify({
        message: "Connected",
        data: {
          identifier: ws.id,
        },
      })
    );
  });
});server.on("upgrade", function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;
  console.log("pathname ",pathname)
  if (pathname === "/geofencing") {
    console.log(`CONNECTED TO WEBSOCKET '${pathname}'`);
    wsGeofencing.handleUpgrade(request, socket, head, function done(ws) {
      wsGeofencing.emit("connection", ws, request);
    });
  } else if (pathname === "/") {
    console.log(`CONNECTED TO WEBSOCKET '${pathname}'`);
    wsGlobal.handleUpgrade(request, socket, head, function done(ws) {
      wsGlobal.emit("connection", ws, request);
    });
  } else if (pathname === "/health") {
    console.log(`CONNECTED TO WEBSOCKET '${pathname}'`);
    wsHealthReport.handleUpgrade(request, socket, head, function done(ws) {
      wsHealthReport.emit("connection", ws, request);
    });
  } 
  else {
    socket.destroy();
  }
});

server.listen(3100, function listening() {
  console.log("Listening on %d", server.address().port);
});

module.exports = {
  wss: wsGlobal,
  wssGeofencing: wsGeofencing,
  wsHealthReport: wsHealthReport
};
