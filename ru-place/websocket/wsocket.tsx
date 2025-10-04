import { Tile } from "../shared/tile";

let socket: WebSocket | null = null;

export function initSocket() {
    if (socket != null) {
        return;
    }
    socket = new WebSocket("ws://127.0.0.1:8080/ws");
}

function awaitOpenConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (socket!.readyState === WebSocket.OPEN) {
            resolve();
        } else {
            socket!.addEventListener("open", (event) => {
                console.log("WebSocket open.");
                resolve();
            });

            socket!.addEventListener("message", (event) => {
                console.log("Message from server ", event!.data);
                resolve();
            });

            socket!.addEventListener("close", (event) => {
                console.log("WebSocket closed.");
                reject();
            });

            socket!.addEventListener("error", (event) => {
                console.error("WebSocket error observed: ", event);
                reject();
            });
        }
    })
}

export async function sendTileUpdate(tile: Tile) {
    await awaitOpenConnection();
    const rpc = { "rpcName": "clientTileUpdate", "payload": tile };
    socket!.send(JSON.stringify(rpc))
}