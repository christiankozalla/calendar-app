package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	}, func(app core.App) error {
		jsonData := `{
			"createRule": null,
			"deleteRule": null,
			"fields": [
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text3208210256",
					"max": 0,
					"min": 0,
					"name": "id",
					"pattern": "^[a-z0-9]+$",
					"presentable": false,
					"primaryKey": true,
					"required": true,
					"system": true,
					"type": "text"
				},
				{
					"cascadeDelete": false,
					"collectionId": "e0u40slpywcgowk",
					"hidden": false,
					"id": "relation1912072331",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "event_id",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				},
				{
					"cascadeDelete": false,
					"collectionId": "9y2yrdqguu576if",
					"hidden": false,
					"id": "_clone_m8kw",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "calendar",
					"presentable": false,
					"required": true,
					"system": false,
					"type": "relation"
				},
				{
					"cascadeDelete": false,
					"collectionId": "_pb_users_auth_",
					"hidden": false,
					"id": "_clone_iQmE",
					"maxSelect": 2147483647,
					"minSelect": 0,
					"name": "calendar_users",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "_clone_fX9B",
					"max": 0,
					"min": 0,
					"name": "event_title",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"hidden": false,
					"id": "_clone_0hEY",
					"name": "event_created",
					"onCreate": true,
					"onUpdate": false,
					"presentable": false,
					"system": false,
					"type": "autodate"
				},
				{
					"cascadeDelete": false,
					"collectionId": "ruyg2acv2qydadj",
					"hidden": false,
					"id": "relation1400509225",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "message_id",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				},
				{
					"hidden": false,
					"id": "_clone_CkDL",
					"name": "message_created",
					"onCreate": true,
					"onUpdate": false,
					"presentable": false,
					"system": false,
					"type": "autodate"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "_clone_oOPg",
					"max": 0,
					"min": 0,
					"name": "message_text",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"cascadeDelete": false,
					"collectionId": "_pb_users_auth_",
					"hidden": false,
					"id": "_clone_9e7p",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "author",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}
			],
			"id": "s8scaqjgl5vaad0",
			"indexes": [],
			"listRule": "calendar_users ~ @request.auth.id",
			"name": "chat",
			"system": false,
			"type": "view",
			"updateRule": null,
			"viewQuery": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id,\n    e.calendar AS calendar,\n    c.users AS calendar_users,\n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text,\n    m.author AS author\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nLEFT JOIN calendars c ON e.calendar = c.id\nORDER BY \n    message_created ASC NULLS LAST, \n    event_created DESC;\n",
			"viewRule": "calendar_users ~ @request.auth.id"
		}`

		collection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
