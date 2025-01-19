package storage

import (
	"context"
	"fmt"
)

type CreateItemRequest struct {
	Name string
}

type Activityy struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (s *Storage) ListItems(ctx context.Context, limit, offset int) ([]*Activity, error) {
	query := `SELECT id, name FROM activities LIMIT ? OFFSET ?`
	rows, err := s.conn.QueryContext(ctx, query, limit, offset)
	defer rows.Close()
	if err != nil {
		return nil, fmt.Errorf("could not retrieve items: %w", err)
	}

	const hmm = "hmm"
	fmt.Printf("\n\n\n%s\n\n\n", hmm)

	var items []*Activity
	for rows.Next() {
		item, err := ScanItem(rows)
		if err != nil {
			return nil, fmt.Errorf("could not scan item: %w", err)
		}

		items = append(items, item)
	}

	return items, nil
}

func ScanItem(s Scanner) (*Activity, error) {
	i := &Activity{}
	err := s.Scan(&i.ID, &i.Name)
	if err != nil {
		return nil, err
	}

	return i, nil
}
