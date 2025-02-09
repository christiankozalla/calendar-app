package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("6g7hkkki0obqudc")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id = calendar_owner || calendar_users ~ @request.auth.id",
			"viewQuery": "SELECT\n    e.id AS id,\n    e.title AS title,\n    e.created AS created,\n    MAX(m.created) AS most_recent_message_time,\n    m.text AS most_recent_message_text,\n    e.calendar AS calendar,\n    c.users AS calendar_users,\n    c.owner AS calendar_owner\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nGROUP BY e.id\nORDER BY\n    -- Sort by whether there is a message or not: messages first, no messages last\n    CASE WHEN MAX(m.created) IS NOT NULL THEN 1 ELSE 0 END DESC,\n    -- Sort by most recent message time (if messages exist)\n    most_recent_message_time DESC NULLS LAST,\n    -- If no messages, sort by event creation date\n    e.created DESC;\n",
			"viewRule": "@request.auth.id = calendar_owner || calendar_users ~ @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("_clone_Pw26")

		// remove field
		collection.Fields.RemoveById("_clone_qhLm")

		// remove field
		collection.Fields.RemoveById("_clone_p6JA")

		// remove field
		collection.Fields.RemoveById("_clone_9UEw")

		// remove field
		collection.Fields.RemoveById("_clone_04Mi")

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "_clone_Qfoe",
			"max": 0,
			"min": 0,
			"name": "title",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
			"hidden": false,
			"id": "_clone_2wBh",
			"name": "created",
			"onCreate": true,
			"onUpdate": false,
			"presentable": false,
			"system": false,
			"type": "autodate"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "_clone_S4oa",
			"max": 0,
			"min": 0,
			"name": "most_recent_message_text",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"cascadeDelete": false,
			"collectionId": "9y2yrdqguu576if",
			"hidden": false,
			"id": "_clone_N3mc",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "calendar",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
			"cascadeDelete": false,
			"collectionId": "_pb_users_auth_",
			"hidden": false,
			"id": "_clone_qpdi",
			"maxSelect": 2147483647,
			"minSelect": 0,
			"name": "calendar_users",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"cascadeDelete": false,
			"collectionId": "_pb_users_auth_",
			"hidden": false,
			"id": "_clone_4CJ7",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "calendar_owner",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("6g7hkkki0obqudc")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "calendar_users ~ @request.auth.id",
			"viewQuery": "SELECT\n    e.id AS id,\n    e.title AS title,\n    e.created AS created,\n    MAX(m.created) AS most_recent_message_time,\n    m.text AS most_recent_message_text,\n    e.calendar AS calendar,\n    c.users AS calendar_users\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nGROUP BY e.id\nORDER BY\n    -- Sort by whether there is a message or not: messages first, no messages last\n    CASE WHEN MAX(m.created) IS NOT NULL THEN 1 ELSE 0 END DESC,\n    -- Sort by most recent message time (if messages exist)\n    most_recent_message_time DESC NULLS LAST,\n    -- If no messages, sort by event creation date\n    e.created DESC;\n",
			"viewRule": "calendar_users ~ @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "_clone_Pw26",
			"max": 0,
			"min": 0,
			"name": "title",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
			"hidden": false,
			"id": "_clone_qhLm",
			"name": "created",
			"onCreate": true,
			"onUpdate": false,
			"presentable": false,
			"system": false,
			"type": "autodate"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "_clone_p6JA",
			"max": 0,
			"min": 0,
			"name": "most_recent_message_text",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"cascadeDelete": false,
			"collectionId": "9y2yrdqguu576if",
			"hidden": false,
			"id": "_clone_9UEw",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "calendar",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
			"cascadeDelete": false,
			"collectionId": "_pb_users_auth_",
			"hidden": false,
			"id": "_clone_04Mi",
			"maxSelect": 2147483647,
			"minSelect": 0,
			"name": "calendar_users",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("_clone_Qfoe")

		// remove field
		collection.Fields.RemoveById("_clone_2wBh")

		// remove field
		collection.Fields.RemoveById("_clone_S4oa")

		// remove field
		collection.Fields.RemoveById("_clone_N3mc")

		// remove field
		collection.Fields.RemoveById("_clone_qpdi")

		// remove field
		collection.Fields.RemoveById("_clone_4CJ7")

		return app.Save(collection)
	})
}
