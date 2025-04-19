package main

import (
	"os"
	"os/signal"
	"syscall"

	// Make sure you change this line to match your module

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"github.com/lucas1richard/activities-go-server/apiserver"
	"github.com/lucas1richard/activities-go-server/functions"
	"github.com/lucas1richard/activities-go-server/persistance"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

const (
	apiServerAddrFlagName string = "addr"
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
		},
		Action: func(c *cli.Context) error {
			done := make(chan os.Signal, 1)
			signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

			stopper := make(chan struct{})
			go func() {
				<-done
				close(stopper)
			}()
			godotenv.Load()

			addr := c.String(apiServerAddrFlagName)
			server, err := apiserver.NewAPIServer(addr)
			if err != nil {
				return err
			}

			couchDb := persistance.InitCouchDB()
			dbConn := persistance.InitMysql()
			defer dbConn.Close()
			defer couchDb.Close(c.Context)

			functions.LongestCommonSubsequence("14207820023", "13875355229")

			return server.Start(stopper)
		},
	}
}
