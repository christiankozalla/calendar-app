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

		// add
		new_owner := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "hmqxtouc",
			"name": "owner",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "_pb_users_auth_",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), new_owner); err != nil {
			return err
		}
		collection.Schema.AddField(new_owner)

		// add
		new_persons := &schema.SchemaField{}
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
		}`), new_persons); err != nil {
			return err
		}
		collection.Schema.AddField(new_persons)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("9y2yrdqguu576if")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("hmqxtouc")

		// remove
		collection.Schema.RemoveField("wyidrmn0")

		return dao.SaveCollection(collection)
	})
}
