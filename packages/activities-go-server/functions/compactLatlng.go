package functions

import (
	"math"

	"github.com/lucas1richard/activities-go-server/protos/activityMatching"
)

func roundToNearest(num float32) float32 {
	return float32(math.Round(float64(num*10000)) / 10000)
}

type LatLngSec struct {
	Lat float32
	Lng float32
	Sec uint
}

func GetCompactedRoute(latlng []LatLng) []*activityMatching.CompactedRouteItem {
	n := len(latlng)
	if n == 0 {
		return []*activityMatching.CompactedRouteItem{}
	}

	out := []*activityMatching.CompactedRouteItem{{Lat: roundToNearest(latlng[0][0]), Lon: roundToNearest(latlng[0][1]), Sec: 0}}

	for i := 1; i < n; i++ {
		curr := &activityMatching.CompactedRouteItem{Lat: roundToNearest(latlng[i][0]), Lon: roundToNearest(latlng[i][1]), Sec: 0}

		if curr.Lat != out[len(out)-1].Lat || curr.Lon != out[len(out)-1].Lon {
			out = append(out, curr)
		} else {
			out[len(out)-1].Sec++
		}
	}

	return out
}
