package placelib

import (
	"log"
	"sync"
	"time"

	"gorm.io/gorm"
)

var InsertChannel []Tile
var InsertChannelMtx sync.Mutex
var OutputChannelsMtx sync.Mutex
var OutputChannels []*chan ServerTileUpdate

// Update the tile database in a timer loop
func UpdateTileDbLoop() {
	dbUpdateTimer := time.NewTicker(500 * time.Millisecond)
	updatesToSend := ServerTileUpdate{}

	for {
		<-dbUpdateTimer.C
		log.Println("tile db update fired")

		// Process the updates we've received thus far
		InsertChannelMtx.Lock()
		for len(InsertChannel) != 0 {
			tile := InsertChannel[0]
			InsertChannel = InsertChannel[1:]

			log.Println("tile to insert is ", tile)

			gorm.G[Tile](Database).Create(DatabaseCtx, &tile)

			updatesToSend.NewTiles = append(updatesToSend.NewTiles, tile)
		}
		InsertChannelMtx.Unlock()

		// Send these updates to the clients
		OutputChannelsMtx.Lock()
		for _, ch := range OutputChannels {
			*ch <- updatesToSend
		}
		OutputChannelsMtx.Unlock()

		// Clear the updates for the next series of updates
		updatesToSend.NewTiles = updatesToSend.NewTiles[0:0]

	}
}
