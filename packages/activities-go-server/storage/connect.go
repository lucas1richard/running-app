package storage

import (
	"database/sql"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Code  string
	Price uint
}

func ConnectGORM(databaseURL string) (*gorm.DB, error) {
	sqlDB, connErr := sql.Open("mysql", databaseURL)

	if connErr != nil {
		return nil, connErr
	}

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn: sqlDB,
	}), &gorm.Config{})

	return gormDB, err
}
