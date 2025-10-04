package placelib

import (
	"encoding/json"

	"gorm.io/gorm"
)

type Tile struct {
	gorm.Model
	X      uint64  `json:"x"`
	Y      uint64  `json:"y"`
	Colour uint8   `json:"color"`
	Lat    float64 `json:"lat"`
	Long   float64 `json:"long"`
}

type ServerTileUpdate struct {
	NewTiles []Tile `json:"newTiles"`
}

type ClientRPC struct {
	RpcName string          `json:"rpcName"`
	Payload json.RawMessage `json:"payload"`
}
