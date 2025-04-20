FROM golang:1.23 AS base

# Create another stage called "dev" that is based off of our "base" stage (so we have golang available to us)
FROM base AS dev

ENV PATH=$GOPATH/bin:$PATH
# Install the air binary so we get live code-reloading when we save files
RUN curl -sSfL https://raw.githubusercontent.com/cosmtrek/air/master/install.sh | sh -s -- -b $(go env GOPATH)/bin

RUN apt-get update && apt-get install -y protobuf-compiler

RUN go get -d -v ./...
RUN go build -o /tmp/api-server ./*.go
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

RUN protoc --go_out=. --go_opt=paths=source_relative \
--go-grpc_out=. --go-grpc_opt=paths=source_relative \
/app/protos/activity-matching-service.proto

# Run the air command in the directory where our code will live
WORKDIR /opt/app/api
CMD ["air"]

FROM base AS built

WORKDIR /go/app/api
COPY . .

ENV CGO_ENABLED=0
ENV GOPATH=/go
ENV PATH=$GOPATH/bin:$PATH

RUN apt-get update && apt-get install -y protobuf-compiler

RUN go get -d -v ./...
RUN go build -o /tmp/api-server ./*.go
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

RUN protoc --go_out=. --go_opt=paths=source_relative \
--go-grpc_out=. --go-grpc_opt=paths=source_relative \
/app/protos/activity-matching-service.proto

FROM busybox

COPY --from=built /tmp/api-server /usr/bin/api-server
CMD ["api-server", "start"]