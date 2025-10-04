package placelib

import (
	"context"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var Database *gorm.DB
var DatabaseCtx context.Context

// Initialize database and return DB instance with context
func dbInit() (*gorm.DB, context.Context) {
	db, err := gorm.Open(sqlite.Open("ruplace.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	ctx := context.Background()
	db.AutoMigrate(&Tile{})
	return db, ctx
}

func DBInit() {
	Database, DatabaseCtx = dbInit()
	log.Println("database ", Database, " context ", DatabaseCtx)
}
