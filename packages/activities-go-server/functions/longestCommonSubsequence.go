package functions

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	_ "github.com/go-kivik/couchdb/v3" // CouchDB driver
	"github.com/go-kivik/kivik/v3"
	"github.com/lucas1richard/activities-go-server/persistance"
	"github.com/lucas1richard/activities-go-server/protos/activityMatching"
)

type Activity struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type LatLng [2]float32

type Stream struct {
	Type string   `json:"type"`
	Data []LatLng `json:"data"`
}

// UnmarshalJSON custom unmarshaler for Stream to handle different data types
func (s *Stream) UnmarshalJSON(data []byte) error {
	// Define a temporary struct with the same fields
	type TempStream struct {
		Type string          `json:"type"`
		Data json.RawMessage `json:"data"`
	}

	var temp TempStream
	if err := json.Unmarshal(data, &temp); err != nil {
		return err
	}

	// Set the type
	s.Type = temp.Type

	// Handle different data types based on the Type field
	switch s.Type {
	case "latlng":
		var latlngArray []LatLng
		if err := json.Unmarshal(temp.Data, &latlngArray); err != nil {
			return err
		}
		s.Data = latlngArray
	}

	return nil
}

type StreamDoc struct {
	Stream []Stream `json:"stream"`
}

func LongestCommonSubsequence(baseId string, compareIds []string) (map[string]*activityMatching.ResponseItem, error) {
	couchDb, er := persistance.InitCouchDB()
	ctx := context.Background()
	defer couchDb.Close(ctx)
	resMap := make(map[string]*activityMatching.ResponseItem)
	if er != nil {
		return resMap, er
	}

	streamsDb := couchDb.DB(ctx, "streams")
	calcChannel := make(chan *activityMatching.ResponseItem)
	act1Latlng, er := getLatLngForActivity(streamsDb, baseId)
	activity1Compacted := GetCompactedRoute(act1Latlng)

	for _, id2 := range compareIds {
		go func() {
			act2Latlng, er := getLatLngForActivity(streamsDb, id2)
			hasErr := er != nil
			activity2Compacted := GetCompactedRoute(act2Latlng)

			calcChannel <- &activityMatching.ResponseItem{
				ActivityId:               id2,
				LongestCommonSubsequence: longestCommonLatlng(activity1Compacted, activity2Compacted),
				Error:                    hasErr,
			}
		}()
	}

	for range compareIds {
		r := <-calcChannel
		resMap[r.ActivityId] = r
	}

	close(calcChannel)

	return resMap, nil
}

func getLatLngForActivity(streamsDb *kivik.DB, id string) ([]LatLng, error) {
	activity1Doc := streamsDb.Get(context.Background(), id)

	var d1 StreamDoc

	scer1 := activity1Doc.ScanDoc(&d1)
	if scer1 != nil {
		message := fmt.Sprintf("Error getting streams document for activity with id %s", id)
		return nil, errors.Join(errors.New(message), scer1)
	}
	for _, item := range d1.Stream {
		if item.Type == "latlng" {
			return item.Data, nil
		}
	}

	message := fmt.Sprintf("Document for %s does not have latlng stream", id)
	return nil, errors.New(message)
}

func longestCommonLatlng(c1 []*activityMatching.CompactedRouteItem, c2 []*activityMatching.CompactedRouteItem) int32 {
	memo := make([][]int32, len(c1))
	for i := range memo {
		memo[i] = make([]int32, len(c2))
		for j := range memo[i] {
			memo[i][j] = -1
		}
	}

	var recurse func(i, j int) int32
	recurse = func(i, j int) int32 {
		if i >= len(c1) || j >= len(c2) {
			return 0
		}
		if memo[i][j] != -1 {
			return memo[i][j]
		}
		if c1[i].Lat == c2[j].Lat && c1[i].Lon == c2[j].Lon {
			memo[i][j] = 1 + recurse(i+1, j+1)
		} else {
			memo[i][j] = max(recurse(i+1, j), recurse(i, j+1))
		}
		return memo[i][j]
	}

	return recurse(0, 0)
}
