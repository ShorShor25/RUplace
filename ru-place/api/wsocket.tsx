import { COLOURS } from "@/components/picker";
import { Tile } from "../shared/tile";
import { TILE_SIZE } from "@/components/grid";

export let socket: WebSocket | null = null;

export function initSocket() {
    if (socket != null && socket.readyState === WebSocket.OPEN) {
        return;
    }
    socket = new WebSocket("ws://127.0.0.1:8080/ws");
}

export async function sendTileUpdate(tile: Tile) {
    const rpc = { rpcName: "clientTileUpdate", payload: tile };
    socket!.send(JSON.stringify(rpc));
}



export async function initialTileLoad() {
    const rpc = { rpcName: "clientTileFill", payload: { xmin: 0, xmax: TILE_SIZE, ymin: 0, ymax: TILE_SIZE } };
    socket!.send(JSON.stringify(rpc));
}
