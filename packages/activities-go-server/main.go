package main

import (
	"database/sql"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	// Make sure you change this line to match your module
	"github.com/go-kivik/kivik/v3"
	_ "github.com/go-sql-driver/mysql"
	"github.com/lucas1richard/activities-go-server/apiserver"
	"github.com/lucas1richard/activities-go-server/functions"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

const (
	apiServerAddrFlagName       string = "addr"
	apiServerStorageDatabaseURL string = "database-url"
	couchDbUser                 string = "admin"
	couchDbPassword             string = "password"
)

func main() {
	if err := app().Run(os.Args); err != nil {
		logrus.WithError(err).Fatal("could not run application")
	}
}

func app() *cli.App {
	return &cli.App{
		Name:  "api-server",
		Usage: "The API",
		Commands: []*cli.Command{
			apiServerCmd(),
		},
	}
}

func apiServerCmd() *cli.Command {
	return &cli.Command{
		Name:  "start",
		Usage: "starts the API server",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: apiServerAddrFlagName, EnvVars: []string{"API_SERVER_ADDR"}},
			&cli.StringFlag{Name: apiServerStorageDatabaseURL, EnvVars: []string{"MYSQL_URL"}},
			&cli.StringFlag{Name: couchDbUser, EnvVars: []string{"COUCHDB_USER"}},
			&cli.StringFlag{Name: couchDbPassword, EnvVars: []string{"COUCHDB_PASSWORD"}},
		},
		Action: func(c *cli.Context) error {
			done := make(chan os.Signal, 1)
			signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

			stopper := make(chan struct{})
			go func() {
				<-done
				close(stopper)
			}()

			databaseURL := c.String(apiServerStorageDatabaseURL)

			fmt.Println(databaseURL)

			addr := c.String(apiServerAddrFlagName)
			server, err := apiserver.NewAPIServer(addr)
			if err != nil {
				return err
			}

			dbConn, dbConnErr := sql.Open("mysql", databaseURL)
			if dbConnErr != nil {
				return dbConnErr
			}
			defer dbConn.Close()

			fmt.Println(couchDbUser, couchDbPassword)

			dataSourceName := fmt.Sprintf(
				"http://%s:%s@strava-couch-db:5984", couchDbUser, couchDbPassword)
			couchDb, err := kivik.New("couch", dataSourceName)
			if err != nil {
				panic(err)
			}
			functions.LongestCommonSubsequence(dbConn, couchDb)

			return server.Start(stopper)
		},
	}
}
