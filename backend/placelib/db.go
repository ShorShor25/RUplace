package placelib

import (
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func init() {
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})

}

func Db() {
	fmt.Println("Hello db world")
}
