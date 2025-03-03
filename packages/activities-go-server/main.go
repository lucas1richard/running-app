package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	// Make sure you change this line to match your module
	"github.com/lucas1richard/activities-go-server/apiserver"
	"github.com/lucas1richard/activities-go-server/storage"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

const (
	apiServerAddrFlagName       string = "addr"
	apiServerStorageDatabaseURL string = "database-url"
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
			s, err := storage.ConnectGORM(databaseURL)
			if err != nil {
				return fmt.Errorf("could not initialize storage: %w", err)
			}

			fmt.Println(s)

			addr := c.String(apiServerAddrFlagName)
			server, err := apiserver.NewAPIServer(addr, s)
			if err != nil {
				return err
			}

			return server.Start(stopper)
		},
	}
}
