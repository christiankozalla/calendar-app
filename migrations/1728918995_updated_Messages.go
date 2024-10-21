package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("ruyg2acv2qydadj")
		if err != nil {
			return err
		}

		collection.Name = "messages"

		collection.ListRule = types.Pointer("event.calendar.users ~ @request.auth.id")

		collection.ViewRule = types.Pointer("event.calendar.users ~ @request.auth.id")

		collection.CreateRule = types.Pointer("@request.auth.id != \"\"")

		collection.UpdateRule = types.Pointer("author.id = @request.auth.id")

		collection.DeleteRule = types.Pointer("author.id = @request.auth.id")

		return dao.SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("ruyg2acv2qydadj")
		if err != nil {
			return err
		}

		collection.Name = "Messages"

		collection.ListRule = nil

		collection.ViewRule = nil

		collection.CreateRule = nil

		collection.UpdateRule = nil

		collection.DeleteRule = nil

		return dao.SaveCollection(collection)
	})
}
