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
		new_color := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "ztwmzioh",
			"name": "color",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "lrqz4bnwj75hk7k",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), new_color); err != nil {
			return err
		}
		collection.Schema.AddField(new_color)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("e0u40slpywcgowk")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("ztwmzioh")

		return dao.SaveCollection(collection)
	})
}
