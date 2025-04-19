package persistance

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/go-kivik/kivik/v3"
)

func GetEnvWithDefault(key string, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
}

var client *kivik.Client
var connectErr error

func InitCouchDB() *kivik.Client {
	if client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		if _, pingErr := client.Ping(ctx); pingErr == nil {
			fmt.Println("Reusing client connection to couchDB")
			return client
		}
	}
	couchDbHost := GetEnvWithDefault("COUCHDB_HOST", "strava-couch-db")
	couchDbPort := GetEnvWithDefault("COUCHDB_PORT", "5984")
	couchDbUser := GetEnvWithDefault("COUCHDB_USER", "admin")
	couchDbPass := GetEnvWithDefault("COUCHDB_PASSWORD", "password")

	err := WaitForPort(couchDbHost, couchDbPort, 30*time.Second)
	if err != nil {
		fmt.Printf("Warning: CouchDB port wait failed: %v\n", err)
	}

	connectionString := fmt.Sprintf("http://%s:%s@%s:%s", couchDbUser, couchDbPass, couchDbHost, couchDbPort)

	fmt.Println("Connecting to CouchDB at:", connectionString)
	client, connectErr = kivik.New("couch", connectionString)

	if connectErr != nil {
		panic(connectErr)
	}

	return client
}
