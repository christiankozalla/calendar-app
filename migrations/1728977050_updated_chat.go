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
			"query": "SELECT\n    concat(e.id, m.id) AS id,\n    e.id AS event_id, \n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// remove
		collection.Schema.RemoveField("rq3ovbzf")

		// remove
		collection.Schema.RemoveField("2imlw28q")

		// remove
		collection.Schema.RemoveField("mvwjwp7y")

		// remove
		collection.Schema.RemoveField("cp3nugul")

		// remove
		collection.Schema.RemoveField("bpww2d4y")

		// add
		new_event_id := &schema.SchemaField{}
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
		}`), new_event_id); err != nil {
			return err
		}
		collection.Schema.AddField(new_event_id)

		// add
		new_event_title := &schema.SchemaField{}
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
		}`), new_event_title); err != nil {
			return err
		}
		collection.Schema.AddField(new_event_title)

		// add
		new_event_created := &schema.SchemaField{}
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
		}`), new_event_created); err != nil {
			return err
		}
		collection.Schema.AddField(new_event_created)

		// add
		new_message_id := &schema.SchemaField{}
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
		}`), new_message_id); err != nil {
			return err
		}
		collection.Schema.AddField(new_message_id)

		// add
		new_message_created := &schema.SchemaField{}
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
		}`), new_message_created); err != nil {
			return err
		}
		collection.Schema.AddField(new_message_created)

		// add
		new_message_text := &schema.SchemaField{}
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

		options := map[string]any{}
		if err := json.Unmarshal([]byte(`{
			"query": "SELECT \n    e.id AS id, \n    e.title AS event_title, \n    e.created AS event_created, \n    m.id AS message_id, \n    m.created AS message_created,\n    m.text AS message_text\nFROM events e\nLEFT JOIN messages m ON e.id = m.event\nORDER BY \n    message_created DESC NULLS LAST, \n    event_created DESC;\n"
		}`), &options); err != nil {
			return err
		}
		collection.SetOptions(options)

		// add
		del_event_title := &schema.SchemaField{}
		if err := json.Unmarshal([]byte(`{
			"system": false,
			"id": "rq3ovbzf",
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
			"id": "2imlw28q",
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
			"id": "mvwjwp7y",
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
			"id": "cp3nugul",
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
			"id": "bpww2d4y",
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

		return dao.SaveCollection(collection)
	})
}
