package storage

import (
	"context"
	"fmt"
)

type Activity struct {
	ID                            string  `json:"id"`
	Has_Streams                   bool    `json:"has_streams"`
	Name                          string  `json:"name"`
	Distance                      float32 `json:"distance"`
	Moving_Time                   uint    `json:"moving_time"`
	Elapsed_Time                  uint    `json:"elapsed_time"`
	Total_Elevation_Gain          float32 `json:"total_elevation_gain"`
	Type                          string  `json:"type"`
	Sport_Type                    string  `json:"sport_type"`
	Start_Date                    string  `json:"start_date"`
	Start_Date_Local              string  `json:"start_date_local"`
	Timezone                      string  `json:"timezone"`
	UTC_Offset                    uint    `json:"utc_offset"`
	Location_City                 string  `json:"location_city"`
	Location_state                string  `json:"location_state"`
	Location_country              string  `json:"location_country"`
	Achievement_Count             uint    `json:"achievement_count"`
	Kudos_count                   uint    `json:"kudos_count"`
	Comment_count                 uint    `json:"comment_count"`
	Athlete_count                 uint    `json:"athlete_count"`
	Photo_count                   uint    `json:"photo_count"`
	Trainer                       bool    `json:"trainer"`
	Commute                       bool    `json:"commute"`
	Manual                        bool    `json:"manual"`
	Private                       bool    `json:"private"`
	Visibility                    string  `json:"visibility"`
	Flagged                       bool    `json:"flagged"`
	Gear_id                       string  `json:"gear_id"`
	Average_speed                 float32 `json:"average_speed"`
	Max_speed                     float32 `json:"max_speed"`
	Has_heartrate                 bool    `json:"has_heartrate"`
	Average_heartrate             float32 `json:"average_heartrate"`
	Max_heartrate                 uint    `json:"max_heartrate"`
	Heartrate_opt_out             bool    `json:"heartrate_opt_out"`
	Display_hide_heartrate_option bool    `json:"display_hide_heartrate_option"`
	Elev_high                     float32 `json:"elev_high"`
	Elev_low                      float32 `json:"elev_low"`
	Upload_id                     uint    `json:"upload_id"`
	Upload_id_str                 string  `json:"upload_idstr"`
	External_id                   string  `json:"external_id"`
	From_accepted_tag             bool    `json:"from_accepted_tag"`
	Pr_count                      uint    `json:"pr_count"`
	Total_photo_count             uint    `json:"total_photo_count"`
	Has_kudoed                    bool    `json:"has_kudoed"`
	Summary_polyline              string  `json:"summary_polyline"`
	Hidden                        bool    `json:"hidden"`
	// start_latlng: {
	// 	type: DataTypes.GEOMETRY('POINT'),
	// 	get() {
	// 		return this.getDataValue('start_latlng')?.coordinates;
	// 	}
	// },
	// end_latlng: {
	// 	type: DataTypes.GEOMETRY('POINT'),
	// 	get() {
	// 		return this.getDataValue('end_latlng')?.coordinates;
	// 	}
	// },
}

func (s *Storage) ListActivities(ctx context.Context, limit, offset int) ([]*Activity, error) {
	// total_elevation_gain,
	// type,
	// sport_type,
	// start_date,
	// start_date_local,
	// timezone,
	// utc_offset,
	// location_city,
	// location_state,
	// location_country,
	// achievement_count,
	// kudos_count,
	// comment_count,
	// athlete_count,
	// photo_count,
	// trainer,
	// commute,
	// manual,
	// private,
	// visibility,
	// flagged,
	// gear_id,
	// average_speed,
	// max_speed,
	// has_heartrate,
	// average_heartrate,
	// max_heartrate,
	// heartrate_opt_out,
	// display_hide_heartrate_option,
	// elev_high,
	// elev_low,
	// upload_id,
	// upload_idstr,
	// external_id,
	// from_accepted_tag,
	// pr_count,
	// total_photo_count,
	// has_kudoed,
	// summary_polyline,
	// hidden
	query := `SELECT id, name FROM activities LIMIT ? OFFSET ?`
	rows, err := s.conn.QueryContext(ctx, query, limit, offset)
	defer rows.Close()
	if err != nil {
		return nil, fmt.Errorf("could not retrieve activities: %w", err)
	}

	var activities []*Activity
	for rows.Next() {
		item, err := scanActivity(rows)
		if err != nil {
			return nil, fmt.Errorf("could not scan item: %w", err)
		}

		activities = append(activities, item)
	}

	return activities, nil
}

func scanActivity(s Scanner) (*Activity, error) {
	i := &Activity{}
	err := s.Scan(
		&i.ID,
		// &i.Has_Streams,
		&i.Name,
		// &i.Distance,
		// &i.Moving_Time,
		// &i.Elapsed_Time,
		// &i.Total_Elevation_Gain,
		// &i.Type,
		// &i.Sport_Type,
		// &i.Start_Date,
		// &i.Start_Date_Local,
		// &i.Timezone,
		// &i.UTC_Offset,
		// &i.Location_City,
		// &i.Location_state,
		// &i.Location_country,
		// &i.Achievement_Count,
		// &i.Kudos_count,
		// &i.Comment_count,
		// &i.Athlete_count,
		// &i.Photo_count,
		// &i.Trainer,
		// &i.Commute,
		// &i.Manual,
		// &i.Private,
		// &i.Visibility,
		// &i.Flagged,
		// &i.Gear_id,
		// &i.Average_speed,
		// &i.Max_speed,
		// &i.Has_heartrate,
		// &i.Average_heartrate,
		// &i.Max_heartrate,
		// &i.Heartrate_opt_out,
		// &i.Display_hide_heartrate_option,
		// &i.Elev_high,
		// &i.Elev_low,
		// &i.Upload_id,
		// &i.Upload_id_str,
		// &i.External_id,
		// &i.From_accepted_tag,
		// &i.Pr_count,
		// &i.Total_photo_count,
		// &i.Has_kudoed,
		// &i.Summary_polyline,
		// &i.Hidden,
	)
	if err != nil {
		return nil, err
	}

	return i, nil
}
