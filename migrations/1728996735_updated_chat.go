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
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id,\n    e.calendar AS calendar,\n    c.users AS calendar_users,\n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text,\n    m.author AS message_author\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// remove
		collection.Schema.RemoveField("9qpbd3qy")

		// remove
		collection.Schema.RemoveField("r5y93zrq")

		// remove
		collection.Schema.RemoveField("7gcxupbn")

		// remove
		collection.Schema.RemoveField("dsae4c2t")

		// remove
		collection.Schema.RemoveField("kmylgqas")

		// remove
		collection.Schema.RemoveField("qptweujj")

		// remove
		collection.Schema.RemoveField("8qfv4bq4")

		// remove
		collection.Schema.RemoveField("yku229qf")

		// add
		new_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "koupdjyf",
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
			"id": "xbtmylzz",
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
			"id": "aq14svxj",
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
			"id": "c9sengyg",
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
			"id": "i7qxnxpl",
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
			"id": "ihuaz4jk",
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
			"id": "itwgcvj0",
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
			"id": "yzhjxs30",
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
		new_message_author := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "qwmmr2az",
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
		}`), new_message_author); err != nil {
			return err
		}
		collection.Schema.AddField(new_message_author)

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id,\n    e.calendar AS calendar,\n    c.users AS calendar_users,\n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// add
		del_event_id := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "9qpbd3qy",
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
			"id": "r5y93zrq",
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
			"id": "7gcxupbn",
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
			"id": "dsae4c2t",
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
			"id": "kmylgqas",
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
			"id": "qptweujj",
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
			"id": "8qfv4bq4",
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
			"id": "yku229qf",
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
		collection.Schema.RemoveField("koupdjyf")

		// remove
		collection.Schema.RemoveField("xbtmylzz")

		// remove
		collection.Schema.RemoveField("aq14svxj")

		// remove
		collection.Schema.RemoveField("c9sengyg")

		// remove
		collection.Schema.RemoveField("i7qxnxpl")

		// remove
		collection.Schema.RemoveField("ihuaz4jk")

		// remove
		collection.Schema.RemoveField("itwgcvj0")

		// remove
		collection.Schema.RemoveField("yzhjxs30")

		// remove
		collection.Schema.RemoveField("qwmmr2az")

		return dao.SaveCollection(collection)
	})
}
