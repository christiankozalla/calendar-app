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
		new_endDatetime := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "nse08qkv",
			"name": "endDatetime",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), new_endDatetime); err != nil {
			return err
		}
		collection.Schema.AddField(new_endDatetime)

		// update
		edit_startDatetime := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "kflnnf02",
			"name": "startDatetime",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), edit_startDatetime); err != nil {
			return err
		}
		collection.Schema.AddField(edit_startDatetime)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("e0u40slpywcgowk")
		if err != nil {
			return err
		}

		// remove
		collection.Schema.RemoveField("nse08qkv")

		// update
		edit_startDatetime := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "kflnnf02",
			"name": "datetime",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), edit_startDatetime); err != nil {
			return err
		}
		collection.Schema.AddField(edit_startDatetime)

		return dao.SaveCollection(collection)
	})
}
