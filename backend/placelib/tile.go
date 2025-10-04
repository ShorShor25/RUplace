package placelib

import (
	"log"
	"sync"
	"time"

	"gorm.io/gorm/clause"
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

			// TODO: This should update if it's not there already
			Database.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "x"}, {Name: "y"}},
				UpdateAll: true,
			}).Create(&tile)

			updatesToSend.NewTiles = append(updatesToSend.NewTiles, tile)
		}
		InsertChannelMtx.Unlock()

		// Send these updates to the clients
		// Only send if there's something to send
		if len(updatesToSend.NewTiles) > 0 {
			OutputChannelsMtx.Lock()
			for _, ch := range OutputChannels {
				*ch <- updatesToSend
			}
			OutputChannelsMtx.Unlock()
		}

		// Clear the updates for the next series of updates
		updatesToSend.NewTiles = updatesToSend.NewTiles[0:0]

	}
}
