package persistance

import (
	"fmt"
	"net"
	"time"
)

// WaitForPort tries to connect to the specified host:port until it succeeds or times out
func WaitForPort(host string, port string, timeout time.Duration) error {
	target := fmt.Sprintf("%s:%s", host, port)
	deadline := time.Now().Add(timeout)

	for tries := 0; time.Now().Before(deadline); tries++ {
		conn, err := net.DialTimeout("tcp", target, time.Second)
		if err == nil {
			conn.Close()
			fmt.Printf("Successfully connected to %s after %d tries\n", target, tries+1)
			return nil
		}

		fmt.Printf("Waiting for %s to become available... (attempt %d)\n", target, tries+1)
		time.Sleep(time.Second) // Wait before retrying
	}

	return fmt.Errorf("timeout waiting for %s after %v", target, timeout)
}
