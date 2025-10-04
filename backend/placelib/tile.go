package placelib

import (
	"log"
	"time"
)

// Update the tile database in a timer loop
func UpdateTileDbLoop() {
	dbUpdateTimer := time.NewTimer(500 * time.Millisecond)

	for {
		<-dbUpdateTimer.C
		log.Print("tile db update fired")
	}
}
