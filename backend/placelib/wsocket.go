package placelib

import "net/http"
import "github.com/gorilla/websocket"
import "encoding/json"
import "log"

var upgrader = websocket.Upgrader{}

const ADDR = "0.0.0.0:8080"

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("couldn't upgrade websocket connection: ", err)
		return
	}
	defer c.Close()

	// Main loop for receiving stuff
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

		log.Println("rpcname is ", rpc.RpcName)

		switch rpc.RpcName {
		case "clientTileUpdate":
			InsertChannelMtx.Lock()

			var tile Tile

			json.Unmarshal(rpc.Payload, &tile)
			InsertChannel = append(InsertChannel, tile)

			InsertChannelMtx.Unlock()

		default:
			log.Println("invalid RPC name ")

		}

		log.Println("got msg: msgType ", msgType, " msg ", msg)
	}
}

func WSMain() {
	go UpdateTileDbLoop()

	http.HandleFunc("/ws", wsEndpoint)
	go log.Fatal(http.ListenAndServe(ADDR, nil))
}
