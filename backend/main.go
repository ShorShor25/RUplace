package main

import placelib "ruplace.live/backend/placelib"

func main() {
	placelib.DBInit()
	placelib.WSMain()
}
