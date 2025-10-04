var socket = new WebSocket("ws://0.0.0.0:8080/ws");
socket.addEventListener("open", function (event) {
    socket.send(JSON.stringify({ "x": 1, "y": 2, "color": 6, "lat": 69.69, "long": 47.74 }));
});
socket.addEventListener("message", function (event) {
    console.log("Message from server ", event.data);
});
socket.addEventListener("close", function (event) {
    console.log("WebSocket closed.");
});
socket.addEventListener("error", function (event) {
    console.error("WebSocket error observed: ", event);
});
