package persistance

import (
	"database/sql"
	"fmt"
	"time"
)

var dbConn *sql.DB
var dbConnErr error

func InitMysql() (*sql.DB, error) {
	if dbConn != nil {
		return dbConn, nil
	}
	databaseUrl := GetEnvWithDefault("MYSQL_URL", "")

	err := WaitForPort("strava-mysql", "3306", 30*time.Second)
	if err != nil {
		fmt.Printf("Warning: CouchDB port wait failed: %v\n", err)
	}

	fmt.Println("Connecting to MySql at:", databaseUrl)

	dbConn, dbConnErr = sql.Open("mysql", databaseUrl)
	if dbConnErr != nil {
		return nil, dbConnErr
	}

	return dbConn, nil
}
