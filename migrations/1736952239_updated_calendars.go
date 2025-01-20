package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("9y2yrdqguu576if")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"cascadeDelete": false,
			"collectionId": "36j5ldj6z3p8kun",
			"hidden": false,
			"id": "relation2723989459",
			"maxSelect": 999,
			"minSelect": 0,
			"name": "persons",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("9y2yrdqguu576if")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("relation2723989459")

		return app.Save(collection)
	})
}
