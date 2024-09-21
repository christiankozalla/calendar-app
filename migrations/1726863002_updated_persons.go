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

		collection, err := dao.FindCollectionByNameOrId("36j5ldj6z3p8kun")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("ryl7rgjl")

		// add
		new_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "08yp2jbh",
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

		collection, err := dao.FindCollectionByNameOrId("36j5ldj6z3p8kun")
		if err != nil {
			return err
		}

		// add
		del_owners := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "ryl7rgjl",
			"name": "owners",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "_pb_users_auth_",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": null,
				"displayFields": null
			}
		}`), del_owners); err != nil {
			return err
		}
		collection.Schema.AddField(del_owners)

		// remove
		collection.Schema.RemoveField("08yp2jbh")

		return dao.SaveCollection(collection)
	})
}
