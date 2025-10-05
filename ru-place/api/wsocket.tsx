import { COLOURS } from "@/components/picker";
import { Tile } from "../shared/tile";

export let socket: WebSocket | null = null;

export function initSocket() {
        if (socket != null && socket.readyState === WebSocket.OPEN) {
            return;
        }

        socket = new WebSocket("ws://127.0.0.1:8080/ws");

        /*socket.addEventListener("open", (event) => {
            resolve();
        });


        socket.addEventListener("error", (event) => {
            console.error("WebSocket error observed: ", event);
            reject(event);
        });*/
}

export async function sendTileUpdate(tile: Tile) {
    console.log("tile update")
    const rpc = { rpcName: "clientTileUpdate", payload: tile };
    socket!.send(JSON.stringify(rpc));
}

