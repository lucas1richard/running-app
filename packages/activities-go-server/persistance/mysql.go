package persistance

import (
	"database/sql"
	"fmt"
	"time"
)

var dbConn *sql.DB
var dbConnErr error

func InitMysql() *sql.DB {
	if dbConn != nil {
		return dbConn
	}
	databaseUrl := GetEnvWithDefault("MYSQL_URL", "")

	err := WaitForPort("strava-mysql", "3306", 30*time.Second)
	if err != nil {
		fmt.Printf("Warning: CouchDB port wait failed: %v\n", err)
	}

	fmt.Println("Connecting to MySql at:", databaseUrl)

	dbConn, dbConnErr = sql.Open("mysql", databaseUrl)
	if dbConnErr != nil {
		panic(dbConnErr)
	}

	return dbConn
}
