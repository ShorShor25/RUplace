package placelib

import (
	"log"
	"sync"
	"time"
)

var InsertChannel []Tile
var InsertChannelMtx sync.Mutex

// Update the tile database in a timer loop
func UpdateTileDbLoop() {
	dbUpdateTimer := time.NewTicker(500 * time.Millisecond)

	for {
		<-dbUpdateTimer.C
		log.Println("tile db update fired")

		InsertChannelMtx.Lock()

		log.Println("channel data is ", InsertChannel)
		clear(InsertChannel)

		InsertChannelMtx.Unlock()

	}
}
