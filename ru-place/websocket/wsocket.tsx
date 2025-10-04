import { Tile } from "../shared/interfaces";

export function connect() {
    const socket = new WebSocket("ws://127.0.0.1:8080/ws");

    socket.addEventListener("open", (event) => {
        const tile: Tile = { "x": 1, "y": 2, "color": 6, "lat": 69.69, "long": 47.74 };
        socket.send(JSON.stringify(tile));
    });

    socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
    });

    socket.addEventListener("close", (event) => {
        console.log("WebSocket closed.");
    });

    socket.addEventListener("error", (event) => {
        console.error("WebSocket error observed: ", event);
    });
}