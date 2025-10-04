package placelib

import "net/http"
import "github.com/gorilla/websocket"
import "log"

var upgrader = websocket.Upgrader{}

const ADDR = "0.0.0.0:8080"

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("couldn't upgrade websocket connection: ", err)
		return
	}
	defer c.Close()

	for {
		msgType, msg, err := c.ReadMessage()
		if err != nil {
			log.Printf("couldn't read msg from websocket ", err)
		}

		log.Printf("got msg: msgType ", msgType, " msg ", msg)
	}
}

func WSMain() {
	http.HandleFunc("/ws", wsEndpoint)
	log.Fatal(http.ListenAndServe(ADDR, nil))
}
