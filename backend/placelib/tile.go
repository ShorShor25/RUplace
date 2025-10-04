package placelib

import (
	"log"
	"sync"
	"time"

	"gorm.io/gorm"
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

		for len(InsertChannel) != 0 {
			tile := InsertChannel[0]
			InsertChannel = InsertChannel[1:]

			log.Println("tile to insert is ", tile)

			gorm.G[Tile](Database).Create(DatabaseCtx, &tile)
		}

		InsertChannelMtx.Unlock()

	}
}
