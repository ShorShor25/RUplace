package placelib

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Disable CORS for now
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

const ADDR = "127.0.0.1:8080"

func wsProcessRecv(c *websocket.Conn, wsChan *chan []byte) {
	for {
		msgType, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("couldn't read msg from websocket ", err)
			return
		}

		var rpc ClientRPC
		err = json.Unmarshal(msg, &rpc)
		if err != nil {
			log.Println("couldn't turn rpc to clientrpc ", err)
		}

		switch rpc.RpcName {
		case "clientTileUpdate":
			InsertChannelMtx.Lock()

			var tile Tile

			json.Unmarshal(rpc.Payload, &tile)
			InsertChannel = append(InsertChannel, tile)

			InsertChannelMtx.Unlock()

		default:
			log.Println("invalid RPC name ", rpc.RpcName)

		}
		log.Println("handled msg: msgType ", msgType, " msg ", msg)
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("couldn't upgrade websocket connection: ", err)
		return
	}
	defer c.Close()

	// Insert to channel
	wsCh := make(chan ServerTileUpdate)
	wsRecvCh := make(chan []byte)

	OutputChannelsMtx.Lock()
	OutputChannels = append(OutputChannels, &wsCh)
	OutputChannelsMtx.Unlock()

	// Main loop for receiving stuff
	go wsProcessRecv(c, &wsRecvCh)

	// For sending stuff
	for {
		sendTile := <-wsCh

		sendTileJsonBytes, err := json.Marshal(ServerUpdate{UpdateType: "serverTileUpdate", Payload: sendTile})
		if err != nil {
			log.Println("couldn't convert tile update event to json: ", err)
		}

		c.WriteMessage(websocket.BinaryMessage, sendTileJsonBytes)
	}
}

func WSMain() {
	go UpdateTileDbLoop()

	http.HandleFunc("/ws", wsEndpoint)
	go log.Fatal(http.ListenAndServe(ADDR, nil))
}
