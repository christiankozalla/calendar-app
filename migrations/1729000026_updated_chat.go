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

		collection, err := dao.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id,\n    e.calendar AS calendar,\n    c.users AS calendar_users,\n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text,\n    m.author AS author\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nORDER BY \n    message_created ASC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// remove
		collection.Schema.RemoveField("svfs7qdy")

		// remove
		collection.Schema.RemoveField("n5yib42g")

		// remove
		collection.Schema.RemoveField("x1wposuj")

		// remove
		collection.Schema.RemoveField("elevnil7")

		// remove
		collection.Schema.RemoveField("pqtfkgoh")

		// remove
		collection.Schema.RemoveField("l1fwh5ke")

		// remove
		collection.Schema.RemoveField("qyeoan1h")

		// remove
		collection.Schema.RemoveField("gsm291q0")

		// remove
		collection.Schema.RemoveField("d9w1l50n")

		// add
		new_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "jwkeolmy",
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
		new_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "knup3doz",
			"name": "calendar",
			"type": "relation",
			"required": true,
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

		// add
		new_calendar_users := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "pbcguek1",
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
			"id": "4toxnu39",
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
			"id": "nacovdoj",
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
			"id": "edlhtqe0",
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
			"id": "agssymob",
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
			"id": "wmf5cuxp",
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

		// add
		new_author := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "xolk1qgm",
			"name": "author",
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
		}`), new_author); err != nil {
			return err
		}
		collection.Schema.AddField(new_author)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id,\n    e.calendar AS calendar,\n    c.users AS calendar_users,\n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text,\n    m.author AS message_author\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nORDER BY \n    message_created ASC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// add
		del_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "svfs7qdy",
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
		del_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "n5yib42g",
			"name": "calendar",
			"type": "relation",
			"required": true,
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

		// add
		del_calendar_users := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "x1wposuj",
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
		}`), del_calendar_users); err != nil {
			return err
		}
		collection.Schema.AddField(del_calendar_users)

		// add
		del_event_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "elevnil7",
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
			"id": "pqtfkgoh",
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
			"id": "l1fwh5ke",
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
			"id": "qyeoan1h",
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
			"id": "gsm291q0",
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

		// add
		del_message_author := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "d9w1l50n",
			"name": "message_author",
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
		}`), del_message_author); err != nil {
			return err
		}
		collection.Schema.AddField(del_message_author)

		// remove
		collection.Schema.RemoveField("jwkeolmy")

		// remove
		collection.Schema.RemoveField("knup3doz")

		// remove
		collection.Schema.RemoveField("pbcguek1")

		// remove
		collection.Schema.RemoveField("4toxnu39")

		// remove
		collection.Schema.RemoveField("nacovdoj")

		// remove
		collection.Schema.RemoveField("edlhtqe0")

		// remove
		collection.Schema.RemoveField("agssymob")

		// remove
		collection.Schema.RemoveField("wmf5cuxp")

		// remove
		collection.Schema.RemoveField("xolk1qgm")

		return dao.SaveCollection(collection)
	})
}
