package apiserver

import (
	"net/http"
	// "github.com/lucas1richard/activities-go-server/storage"
)

// func (s *APIServer) createItem(w http.ResponseWriter, req *http.Request) error {
// 	item, err := s.storage.CreateItem(req.Context(), storage.CreateItemRequest{
// 		Name: req.PostFormValue("name"),
// 	})

// 	if err != nil {
// 		return err
// 	}

// 	w.WriteHeader(http.StatusCreated)
// 	_, err = w.Write([]byte(fmt.Sprintf("New Item ID: %s", item.ID)))
// 	return err
// }

func (s *APIServer) listItems(w http.ResponseWriter, req *http.Request) error {
	// items, err := s.storage.ListActivities(req.Context(), 1000, 0)
	// if err != nil {
	// 	return err
	// }

	// json.NewEncoder(w).Encode(items)
	return nil
}
