package placelib

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// Disable CORS for now
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

const ADDR = "127.0.0.1:8080"

func wsProcessRecv(c *websocket.Conn) {
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
		// When the client wants to send a new tile to the server
		case "clientTileUpdate":
			InsertChannelMtx.Lock()

			var tile Tile

			json.Unmarshal(rpc.Payload, &tile)
			InsertChannel = append(InsertChannel, tile)

			InsertChannelMtx.Unlock()
		// If the client expicitly wants a region of tiles
		case "clientTileFill":
			var fillParams ClientTileFillParams

			json.Unmarshal(rpc.Payload, &fillParams)
			log.Println("fill params ", fillParams.XMax)

			// Call the DB
			coords, err := gorm.G[Tile](Database).Where("x >= ?", fillParams.XMin).Where("x <= ?", fillParams.XMax).Where("y >= ?", fillParams.YMin).Where("y <= ?", fillParams.YMax).Find(DatabaseCtx)
			log.Println("got tiles ", coords)
			if err != nil {
				log.Println("can't query the db for tiles ", err)
				return
			}

			sendTileJsonBytes, err := json.Marshal(ServerUpdate{UpdateType: "serverTileUpdate", Payload: ServerTileUpdate{NewTiles: coords}})
			if err != nil {
				log.Println("couldn't convert tile file event to json: ", err)
			}

			c.WriteMessage(websocket.TextMessage, sendTileJsonBytes)

		default:
			log.Println("invalid RPC name ", rpc.RpcName)

		}
		log.Println("handled msg: msgType ", msgType, " msg ", msg)
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	log.Println("got a tile from the server")

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("couldn't upgrade websocket connection: ", err)
		return
	}
	defer c.Close()

	// Insert to channel
	wsCh := make(chan ServerTileUpdate)

	OutputChannelsMtx.Lock()
	OutputChannels = append(OutputChannels, &wsCh)
	OutputChannelsMtx.Unlock()

	// Main loop for receiving stuff
	go wsProcessRecv(c)

	// For sending stuff
	for {
		sendTile := <-wsCh

		log.Println("sending a tile to the client, namely", sendTile)

		sendTileJsonBytes, err := json.Marshal(ServerUpdate{UpdateType: "serverTileUpdate", Payload: sendTile})
		if err != nil {
			log.Println("couldn't convert tile update event to json: ", err)
		}

		c.WriteMessage(websocket.TextMessage, sendTileJsonBytes)
	}
}

func WSMain() {
	go UpdateTileDbLoop()

	http.HandleFunc("/ws", wsEndpoint)
	go log.Fatal(http.ListenAndServe(ADDR, nil))
}
