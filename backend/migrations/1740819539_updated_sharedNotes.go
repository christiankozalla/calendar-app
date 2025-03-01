package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3623399807")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id = owner || @request.auth.id ~ users",
			"updateRule": "@request.auth.id = owner || @request.auth.id ~ users",
			"viewRule": "@request.auth.id = owner || @request.auth.id ~ users"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3623399807")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id ~ users",
			"updateRule": "@request.auth.id ~ users",
			"viewRule": "@request.auth.id ~ users"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
