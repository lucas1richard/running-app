package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"github.com/lucas1richard/activities-go-server/functions"
	"github.com/lucas1richard/activities-go-server/persistance"
	"github.com/lucas1richard/activities-go-server/protos/activityMatching"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
	"google.golang.org/grpc"
)

const (
	apiServerAddrFlagName string = "addr"
)

var (
	port = flag.Int("port", 50051, "The server port")
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

type activityMatchingServer struct {
	activityMatching.UnimplementedActivityMatchingServer
}

func (s *activityMatchingServer) GetLongestCommonSubsequence(
	_ context.Context,
	req *activityMatching.LCSRequest,
) (*activityMatching.LCSResponse, error) {
	lcs, er := functions.LongestCommonSubsequence(req.Base, req.Compare)
	return &activityMatching.LCSResponse{LongestCommonSubsequence: lcs}, er
}

func (s *activityMatchingServer) GetCompactedRoute(
	_ context.Context,
	req *activityMatching.CompactedRouteRequest,
) (*activityMatching.CompactedRouteResponse, error) {
	coords := make([]functions.LatLng, len(req.Route))
	for i, v := range req.Route {
		coords[i] = functions.LatLng{v.Lat, v.Lon}
	}
	res := functions.GetCompactedRoute(coords)
	fmt.Println(res[1])
	cr := make([]*activityMatching.CRItem, len(res))
	for i, v := range res {
		cr[i] = &activityMatching.CRItem{
			Lat: fmt.Sprintf("%.4f", v.Lat),
			Lon: fmt.Sprintf("%.4f", v.Lon),
			Sec: v.Sec,
		}
	}
	return &activityMatching.CompactedRouteResponse{
		CompactedRoute: cr,
	}, nil
}

func newServer() *activityMatchingServer {
	s := &activityMatchingServer{}
	return s
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
			flag.Parse()

			lis, err := net.Listen("tcp", fmt.Sprintf("activities-go-server:%d", *port))
			// addr := c.String(apiServerAddrFlagName)
			// server, err := apiserver.NewAPIServer(addr)
			if err != nil {
				return err
			}

			couchDb, er := persistance.InitCouchDB()
			if er != nil {
				return er
			}
			dbConn, er := persistance.InitMysql()
			if er != nil {
				return er
			}
			defer dbConn.Close()
			defer couchDb.Close(c.Context)

			grpcServer := grpc.NewServer()
			activityMatching.RegisterActivityMatchingServer(grpcServer, newServer())
			log.Printf("server listening at %v", lis.Addr())
			grpcServer.Serve(lis)
			if err := grpcServer.Serve(lis); err != nil {
				log.Fatalf("failed to serve: %v", err)
			}

			rr := make([]functions.LatLng, 0)
			functions.GetCompactedRoute(rr)
			return nil
		},
	}
}
