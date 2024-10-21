package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `{
			"id": "6g7hkkki0obqudc",
			"created": "2024-10-16 06:38:01.090Z",
			"updated": "2024-10-16 06:38:01.090Z",
			"name": "events_by_message",
			"type": "view",
			"system": false,
			"schema": [
				{
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
				},
				{
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
				},
				{
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
				},
				{
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
				},
				{
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
				}
			],
			"indexes": [],
			"listRule": "calendar_users ~ @request.auth.id",
			"viewRule": "calendar_users ~ @request.auth.id",
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {
				"query": "SELECT\n    e.id AS id,\n    e.title AS event_title,\n    e.created AS event_created,\n    MAX(m.created) AS most_recent_message_time,\n    e.calendar AS calendar,\n    c.users AS calendar_users\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nGROUP BY e.id\nORDER BY\n    -- Sort by whether there is a message or not: messages first, no messages last\n    CASE WHEN MAX(m.created) IS NOT NULL THEN 1 ELSE 0 END DESC,\n    -- Sort by most recent message time (if messages exist)\n    most_recent_message_time DESC NULLS LAST,\n    -- If no messages, sort by event creation date\n    e.created DESC;\n"
			}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("6g7hkkki0obqudc")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
