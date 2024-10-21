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
			"id": "s8scaqjgl5vaad0",
			"created": "2024-10-14 13:44:44.873Z",
			"updated": "2024-10-14 13:44:44.873Z",
			"name": "chat",
			"type": "view",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "ktxptbdt",
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
					"id": "l8jywiqa",
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
					"id": "rbys0nqs",
					"name": "message_id",
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
					"id": "dpeiyn0l",
					"name": "message_created",
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
					"id": "bpghe4qj",
					"name": "message_text",
					"type": "json",
					"required": false,
					"presentable": false,
					"unique": false,
					"options": {
						"maxSize": 1
					}
				}
			],
			"indexes": [],
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {
				"query": "SELECT \n    e.id AS id, \n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
			}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("s8scaqjgl5vaad0")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
