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

		collection, err := dao.FindCollectionByNameOrId("6g7hkkki0obqudc")
		if err != nil {
			return err
		}

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    e.id AS id,\n    e.title AS title,\n    e.created AS created,\n    MAX(m.created) AS most_recent_message_time,\n    e.calendar AS calendar,\n    c.users AS calendar_users\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nGROUP BY e.id\nORDER BY\n    -- Sort by whether there is a message or not: messages first, no messages last\n    CASE WHEN MAX(m.created) IS NOT NULL THEN 1 ELSE 0 END DESC,\n    -- Sort by most recent message time (if messages exist)\n    most_recent_message_time DESC NULLS LAST,\n    -- If no messages, sort by event creation date\n    e.created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// remove
		collection.Schema.RemoveField("rnixgxzs")

		// remove
		collection.Schema.RemoveField("mxqzuk5z")

		// remove
		collection.Schema.RemoveField("0mj3gkwc")

		// remove
		collection.Schema.RemoveField("v5ar4ecv")

		// remove
		collection.Schema.RemoveField("gs8yhbds")

		// add
		new_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "n2yolhxg",
			"name": "title",
			"type": "text",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"min": null,
				"max": null,
				"pattern": ""
			}
		}`), new_title); err != nil {
			return err
		}
		collection.Schema.AddField(new_title)

		// add
		new_most_recent_message_time := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "3uqozjqn",
			"name": "most_recent_message_time",
			"type": "json",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"maxSize": 1
			}
		}`), new_most_recent_message_time); err != nil {
			return err
		}
		collection.Schema.AddField(new_most_recent_message_time)

		// add
		new_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "fwi7ucro",
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
			"id": "5yufm7bl",
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

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("6g7hkkki0obqudc")
		if err != nil {
			return err
		}

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT\n    e.id AS id,\n    e.title AS event_title,\n    e.created AS event_created,\n    MAX(m.created) AS most_recent_message_time,\n    e.calendar AS calendar,\n    c.users AS calendar_users\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nGROUP BY e.id\nORDER BY\n    -- Sort by whether there is a message or not: messages first, no messages last\n    CASE WHEN MAX(m.created) IS NOT NULL THEN 1 ELSE 0 END DESC,\n    -- Sort by most recent message time (if messages exist)\n    most_recent_message_time DESC NULLS LAST,\n    -- If no messages, sort by event creation date\n    e.created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// add
		del_event_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "rnixgxzs",
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
			"id": "mxqzuk5z",
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
		del_most_recent_message_time := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "0mj3gkwc",
			"name": "most_recent_message_time",
			"type": "json",
			"required": false,
			"presentable": false,
			"unique": false,
			"options": {
				"maxSize": 1
			}
		}`), del_most_recent_message_time); err != nil {
			return err
		}
		collection.Schema.AddField(del_most_recent_message_time)

		// add
		del_calendar := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "v5ar4ecv",
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
			"id": "gs8yhbds",
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

		// remove
		collection.Schema.RemoveField("n2yolhxg")

		// remove
		collection.Schema.RemoveField("3uqozjqn")

		// remove
		collection.Schema.RemoveField("fwi7ucro")

		// remove
		collection.Schema.RemoveField("5yufm7bl")

		return dao.SaveCollection(collection)
	})
}
