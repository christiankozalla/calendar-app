package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("36j5ldj6z3p8kun")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("2xrpofhz")

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"hidden": false,
			"id": "file376926767",
			"maxSelect": 1,
			"maxSize": 5242880,
			"mimeTypes": [
				"image/jpeg",
				"image/png"
			],
			"name": "avatar",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": [
				"400x400f",
				"100x100f"
			],
			"type": "file"
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "vx9pyon4",
			"max": 255,
			"min": 0,
			"name": "name",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("36j5ldj6z3p8kun")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
			"exceptDomains": null,
			"hidden": false,
			"id": "2xrpofhz",
			"name": "email",
			"onlyDomains": null,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "email"
		}`)); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("file376926767")

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "vx9pyon4",
			"max": 0,
			"min": 0,
			"name": "name",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
