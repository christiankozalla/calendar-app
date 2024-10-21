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

		collection.ListRule = types.Pointer("calendar_users ~ @request.auth.id")

		collection.ViewRule = types.Pointer("calendar_users ~ @request.auth.id")

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id,\n    c.users AS calendar_users,\n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

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

		// add
		new_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "ycigzpcr",
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
		new_calendar_users := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "2shgs8zt",
			"name": "calendar_users",
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
		}`), new_calendar_users); err != nil {
			return err
		}
		collection.Schema.AddField(new_calendar_users)

		// add
		new_event_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "m0c8sdg4",
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
			"id": "xtgdvugk",
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
			"id": "0ceonbuu",
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
			"id": "nr3fhmaj",
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
			"id": "mopqxfvp",
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

		collection.ListRule = types.Pointer("event_id.calendar.users ~ @request.auth.id")

		collection.ViewRule = types.Pointer("event_id.calendar.users ~ @request.auth.id")

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id, \n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// add
		del_event_id := &schema.SchemaField{}
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
		}`), del_event_id); err != nil {
			return err
		}
		collection.Schema.AddField(del_event_id)

		// add
		del_event_title := &schema.SchemaField{}
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
		}`), del_event_title); err != nil {
			return err
		}
		collection.Schema.AddField(del_event_title)

		// add
		del_event_created := &schema.SchemaField{}
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
		}`), del_event_created); err != nil {
			return err
		}
		collection.Schema.AddField(del_event_created)

		// add
		del_message_id := &schema.SchemaField{}
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
		}`), del_message_id); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_id)

		// add
		del_message_created := &schema.SchemaField{}
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
		}`), del_message_created); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_created)

		// add
		del_message_text := &schema.SchemaField{}
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
		}`), del_message_text); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_text)

		// remove
		collection.Schema.RemoveField("ycigzpcr")

		// remove
		collection.Schema.RemoveField("2shgs8zt")

		// remove
		collection.Schema.RemoveField("m0c8sdg4")

		// remove
		collection.Schema.RemoveField("xtgdvugk")

		// remove
		collection.Schema.RemoveField("0ceonbuu")

		// remove
		collection.Schema.RemoveField("nr3fhmaj")

		// remove
		collection.Schema.RemoveField("mopqxfvp")

		return dao.SaveCollection(collection)
	})
}
