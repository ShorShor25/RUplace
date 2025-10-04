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

type ServerUpdate struct {
	UpdateType string `json:"updateType"`
	Payload    any    `json:"payload"`
}

type ServerTileUpdate struct {
	NewTiles []Tile `json:"newTiles"`
}

type ClientRPC struct {
	RpcName string          `json:"rpcName"`
	Payload json.RawMessage `json:"payload"`
}

type ClientTileFillParams struct {
	XMin uint64
	XMax uint64
	YMin uint64
	YMax uint64
}
