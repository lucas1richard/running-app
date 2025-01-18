package storage

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

type Storage struct {
	conn *sql.DB
}

type Scanner interface {
	Scan(dest ...interface{}) error
}

func NewStorage(databaseURL string) (*Storage, error) {
	conn, err := sql.Open("mysql", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("could not open sql: %w", err)
	}

	return &Storage{
		conn: conn,
	}, nil
}
