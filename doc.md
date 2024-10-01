# Documentation For safety drowsiness storing flow

1. Python Jetson do loop untill image detect drowsiness
2. Class call for generate the base64 format
3. send string of base64 format to database via WS
4. BE receive base64 from Python Jetson
5. Convert base64 to image and save
6. save the path
7. store path to database
