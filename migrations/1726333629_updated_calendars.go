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

		collection, err := dao.FindCollectionByNameOrId("9y2yrdqguu576if")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("r8uxs1io")

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("9y2yrdqguu576if")
		if err != nil {
			return err
		}

		// add
		del_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "r8uxs1io",
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
		}`), del_calendar); err != nil {
			return err
		}
		collection.Schema.AddField(del_calendar)

		return dao.SaveCollection(collection)
	})
}
