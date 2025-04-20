package functions

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"

	_ "github.com/go-kivik/couchdb/v3" // CouchDB driver
	"github.com/go-kivik/kivik/v3"
	"github.com/lucas1richard/activities-go-server/persistance"
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

func LongestCommonSubsequence(activityId1, activityId2 string) (int32, error) {
	couchDb, er := persistance.InitCouchDB()
	if er != nil {
		return 0, er
	}

	ctx := context.Background()
	streamsDb := couchDb.DB(ctx, "streams")

	act1Latlng, er := getLatLngForActivity(streamsDb, activityId1)
	if er != nil {
		return 0, er
	}
	activity1Compacted := compactLatlng(act1Latlng)

	act2Latlng, er := getLatLngForActivity(streamsDb, activityId2)
	if er != nil {
		return 0, er
	}
	activity2Compacted := compactLatlng(act2Latlng)

	defer couchDb.Close(ctx)

	// dbConn := persistance.InitMysql()
	// rows, queryErr := dbConn.Query("select id, name from activities limit 1")
	// if queryErr != nil {
	// 	panic(queryErr)
	// }
	// i := &Activity{}
	//
	// defer rows.Close()
	//
	// for rows.Next() {
	// 	rows.Scan(
	// 		&i.ID,
	// 		&i.Name,
	// 	)
	//
	// 	fmt.Println(i.ID, i.Name)
	// }

	return longestCommonLatlng(activity1Compacted, activity2Compacted), nil
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

func longestCommonLatlng(c1 []LatLng, c2 []LatLng) int32 {
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

		if c1[i] == c2[j] {
			memo[i][j] = 1 + recurse(i+1, j+1)
		} else {
			memo[i][j] = max(recurse(i+1, j), recurse(i, j+1))
		}

		return memo[i][j]
	}

	return recurse(0, 0)
}

func roundToNearest(num float32) float32 {
	return float32(math.Round(float64(num*10000)) / 10000)
}

func compactLatlng(latlng []LatLng) []LatLng {
	if len(latlng) <= 1 {
		return latlng
	}

	var i int
	out := []LatLng{{roundToNearest(latlng[0][0]), roundToNearest(latlng[0][1])}}

	for i = 1; i < len(latlng); i++ {
		curr := LatLng{roundToNearest(latlng[i][0]), roundToNearest(latlng[i][1])}

		if curr[0] != out[len(out)-1][0] || curr[1] != out[len(out)-1][1] {
			out = append(out, curr)
		}
	}

	return out
}
