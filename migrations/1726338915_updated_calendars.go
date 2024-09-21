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
		collection.Schema.RemoveField("rbromfmg")

		// remove
		collection.Schema.RemoveField("wyidrmn0")

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("9y2yrdqguu576if")
		if err != nil {
			return err
		}

		// add
		del_events := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "rbromfmg",
			"name": "events",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "e0u40slpywcgowk",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": null,
				"displayFields": null
			}
		}`), del_events); err != nil {
			return err
		}
		collection.Schema.AddField(del_events)

		// add
		del_persons := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "wyidrmn0",
			"name": "persons",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "36j5ldj6z3p8kun",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": null,
				"displayFields": null
			}
		}`), del_persons); err != nil {
			return err
		}
		collection.Schema.AddField(del_persons)

		return dao.SaveCollection(collection)
	})
}
