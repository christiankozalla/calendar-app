package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("e0u40slpywcgowk")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id = calendar.owner || calendar.users ~ @request.auth.id",
			"updateRule": "owner.id = @request.auth.id",
			"viewRule": "@request.auth.id = calendar.owner || calendar.users ~ @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("e0u40slpywcgowk")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "calendar.users ~ @request.auth.id",
			"updateRule": "calendar.users ~ @request.auth.id",
			"viewRule": "calendar.users ~ @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
