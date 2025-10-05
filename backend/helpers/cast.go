package helpers

import (
	"encoding/json"
	"log"
)

func CastStringToAnyType[T any](data string, value T) error {
	if unmarshal_err := json.Unmarshal([]byte(data), value); unmarshal_err != nil {
		log.Printf("Error with Unmarshal-ing data: %s", unmarshal_err.Error())
		return unmarshal_err
	}

	return nil
}
