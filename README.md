# Documentations Telematics Projects

A backend service for a vehicle telematics system built using **Node.js**, designed to manage biometric access, visitor registration, drowsiness detection, and real-time vehicle monitoring. This system integrates with mobile apps and real-time communication via WebSocket.

---

## 🚗 Vehicle App Features

- 🔐 Biometric access control using fingerprint and RFID  
- 🧾 Visitor registration and key access assignment  
- 📦 Image upload and base64 decoding from Hailo-8 devices  
- 🧠 Driver drowsiness monitoring (camera-based) with storage  
- 📡 WebSocket support for real-time sensor communication  
- 🚘 User–vehicle binding and access activity logging  
- 🌫️ Ambient air monitoring integration (sensor data ingestion)  
- 🧩 Modular route and service structure with token-based auth  
- 🗂️ API endpoints grouped under `/api/v1/*`  
- 🧪 Real-time BLE/ESP32 coordination for door lock control  

## Starting server
Open up the cloned repository in cmd, make sure you are in the right folder, run command `pm2 start bin/www`


## 📁 Project Structure Overview
Telematics-BE-v2/
├── bin/                   # Main server launcher (bin/www)
├── config/
├── controllers/
├── helpers/
├── middleware/
├── public/stylesheets                  
├── routes/                # API route definitions
├── uploads/               # Image upload folder
├── websocket/
├── server.js              # WebSocket for Jetson (camera)
├── server2.js             # WebSocket for ESP32 (BLE)
├── app.js                 # Main express config
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── README.md              # This file
