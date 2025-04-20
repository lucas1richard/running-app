Install dependencies

```sh
docker compose run --rm activities-go-server go mod tidy
```

Update the gRPC proto

```sh
export PATH=$GOPATH/bin:$PATH

go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative ./protos/activityMatching/activity-matching-service.proto
```