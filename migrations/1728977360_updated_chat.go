package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models/schema"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		collection.ListRule = types.Pointer("event_id.calendar.users ~ @request.auth.id")

		collection.ViewRule = types.Pointer("event_id.calendar.users ~ @request.auth.id")

		// remove
		collection.Schema.RemoveField("u07p9zpe")

		// remove
		collection.Schema.RemoveField("8waeks4r")

		// remove
		collection.Schema.RemoveField("ih9oqtau")

		// remove
		collection.Schema.RemoveField("1ypwfwnj")

		// remove
		collection.Schema.RemoveField("jclse3db")

		// remove
		collection.Schema.RemoveField("w4nir0uv")

		// add
		new_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "jj8tjbxa",
			"name": "event_id",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "e0u40slpywcgowk",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), new_event_id); err != nil {
			return err
		}
		collection.Schema.AddField(new_event_id)

		// add
		new_event_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "alukzd1o",
			"name": "event_title",
			"type": "text",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), new_event_title); err != nil {
			return err
		}
		collection.Schema.AddField(new_event_title)

		// add
		new_event_created := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "ybmyirlo",
			"name": "event_created",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), new_event_created); err != nil {
			return err
		}
		collection.Schema.AddField(new_event_created)

		// add
		new_message_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "ruurbaft",
			"name": "message_id",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "ruyg2acv2qydadj",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), new_message_id); err != nil {
			return err
		}
		collection.Schema.AddField(new_message_id)

		// add
		new_message_created := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "lu8dfmkx",
			"name": "message_created",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), new_message_created); err != nil {
			return err
		}
		collection.Schema.AddField(new_message_created)

		// add
		new_message_text := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "njq2hui3",
			"name": "message_text",
			"type": "text",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), new_message_text); err != nil {
			return err
		}
		collection.Schema.AddField(new_message_text)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		collection.ListRule = nil

		collection.ViewRule = nil

		// add
		del_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "u07p9zpe",
			"name": "event_id",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "e0u40slpywcgowk",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), del_event_id); err != nil {
			return err
		}
		collection.Schema.AddField(del_event_id)

		// add
		del_event_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "8waeks4r",
			"name": "event_title",
			"type": "text",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), del_event_title); err != nil {
			return err
		}
		collection.Schema.AddField(del_event_title)

		// add
		del_event_created := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "ih9oqtau",
			"name": "event_created",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), del_event_created); err != nil {
			return err
		}
		collection.Schema.AddField(del_event_created)

		// add
		del_message_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "1ypwfwnj",
			"name": "message_id",
			"type": "relation",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"collectionId": "ruyg2acv2qydadj",
				"cascadeDelete": false,
				"minSelect": null,
				"maxSelect": 1,
				"displayFields": null
			}
		}`), del_message_id); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_id)

		// add
		del_message_created := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "jclse3db",
			"name": "message_created",
			"type": "date",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": "",
				"max": ""
			}
		}`), del_message_created); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_created)

		// add
		del_message_text := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "w4nir0uv",
			"name": "message_text",
			"type": "text",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), del_message_text); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_text)

		// remove
		collection.Schema.RemoveField("jj8tjbxa")

		// remove
		collection.Schema.RemoveField("alukzd1o")

		// remove
		collection.Schema.RemoveField("ybmyirlo")

		// remove
		collection.Schema.RemoveField("ruurbaft")

		// remove
		collection.Schema.RemoveField("lu8dfmkx")

		// remove
		collection.Schema.RemoveField("njq2hui3")

		return dao.SaveCollection(collection)
	})
}
