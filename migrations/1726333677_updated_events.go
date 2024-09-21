package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models/schema"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("e0u40slpywcgowk")
		if err != nil {
			return err
		}

		// add
		new_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "yjauhsdr",
			"name": "calendar",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "9y2yrdqguu576if",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), new_calendar); err != nil {
			return err
		}
		collection.Schema.AddField(new_calendar)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("e0u40slpywcgowk")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("yjauhsdr")

		return dao.SaveCollection(collection)
	})
}
