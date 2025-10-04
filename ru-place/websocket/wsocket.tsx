import { Tile } from "../shared/tile";

export let socket: WebSocket | null = null;

export async function initSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (socket != null && socket.readyState === WebSocket.OPEN) {
            resolve();
            return;
        }

        socket = new WebSocket("ws://127.0.0.1:8080/ws");

        socket.addEventListener("open", (event) => {
            resolve();
        });

        socket.addEventListener("message", (event) => {
            forwardServerUpdateToGraphics(event.data);
        });

        socket.addEventListener("error", (event) => {
            console.error("WebSocket error observed: ", event);
            reject(event);
        });
    });
}

export async function sendTileUpdate(tile: Tile) {
    await initSocket();
    const rpc = { rpcName: "clientTileUpdate", payload: tile };
    socket!.send(JSON.stringify(rpc));
}

function forwardServerUpdateToGraphics(data: any) {
    console.log("Forwarding server update to graphics: ", data);
}
