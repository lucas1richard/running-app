package functions

import (
	"context"
	"encoding/json"
	"fmt"
	"math"

	_ "github.com/go-kivik/couchdb/v3" // CouchDB driver
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

func LongestCommonSubsequence(activityId1, activityId2 string) {
	couchDb := persistance.InitCouchDB()
	ctx := context.Background()
	streamsDb := couchDb.DB(ctx, "streams")
	activity1Doc := streamsDb.Get(ctx, activityId1)
	activity2Doc := streamsDb.Get(ctx, activityId2)

	var d1 StreamDoc
	var activity1Compacted []LatLng

	var d2 StreamDoc
	var activity2Compacted []LatLng

	scer1 := activity1Doc.ScanDoc(&d1)
	if scer1 != nil {
		panic(scer1)
	}
	scer2 := activity2Doc.ScanDoc(&d2)
	if scer2 != nil {
		panic(scer2)
	}

	for _, item := range d1.Stream {
		if item.Type == "latlng" {
			activity1Compacted = compactLatlng(item.Data)
		}
	}

	for _, item := range d2.Stream {
		if item.Type == "latlng" {
			activity2Compacted = compactLatlng(item.Data)
		}
	}

	defer couchDb.Close(ctx)

	dbConn := persistance.InitMysql()
	rows, queryErr := dbConn.Query("select id, name from activities limit 1")
	if queryErr != nil {
		panic(queryErr)
	}
	i := &Activity{}

	defer rows.Close()

	for rows.Next() {
		rows.Scan(
			&i.ID,
			&i.Name,
		)

		fmt.Println(i.ID, i.Name)
	}

	fmt.Println("\n\n\n", longestCommonLatlng(activity1Compacted, activity2Compacted))
}

func longestCommonLatlng(c1 []LatLng, c2 []LatLng) int {
	memo := make([][]int, len(c1))
	for i := range memo {
		memo[i] = make([]int, len(c2))
		for j := range memo[i] {
			memo[i][j] = -1
		}
	}

	var recurse func(i, j int) int
	recurse = func(i, j int) int {
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
