package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

type Color struct {
	Name string `json:"name"`
	Hex  string `json:"hex"`
}

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db)

		jsonColors := `[
	{ "name": "Soft Coral", "hex": "#FFB6B9" },
	{ "name": "Warm Salmon", "hex": "#FF6F61" },
	{ "name": "Blush Pink", "hex": "#F7CAC9" },
	{ "name": "Sand Beige", "hex": "#F5E6CC" },
	{ "name": "Earthy Brown", "hex": "#D4A373" },
	{ "name": "Mint Green", "hex": "#A2D5AB" },
	{ "name": "Sunflower Yellow", "hex": "#FFD966" },
	{ "name": "Coral Pink", "hex": "#FF847C" },
	{ "name": "Light Sage", "hex": "#E0E7DA" },
	{ "name": "Almond", "hex": "#EDC9AF" },
	{ "name": "Deep Purple", "hex": "#6A0572" },
	{ "name": "Sea Green", "hex": "#16A085" },
	{ "name": "Peachy Orange", "hex": "#FF9F68" },
	{ "name": "Soft Teal", "hex": "#45A29E" },
	{ "name": "Lavender Blue", "hex": "#6C5CE7" },
	{ "name": "Bright Orange", "hex": "#F39C12" },
	{ "name": "Golden Yellow", "hex": "#F1C40F" },
	{ "name": "Bold Red", "hex": "#E74C3C" },
	{ "name": "Sky Blue", "hex": "#2980B9" },
	{ "name": "Vibrant Purple", "hex": "#8E44AD" }
]`

		colorsCollection, err := dao.FindCollectionByNameOrId("colors")
		if err != nil {
			return err
		}

		var colors []Color
		err = json.Unmarshal([]byte(jsonColors), &colors)
		if err != nil {
			return err
		}

		for _, color := range colors {
			record, err := dao.FindFirstRecordByData("colors", "hex", color.Hex)
			if err != nil || record == nil {
				// color does not exist yet
				newRecord := models.NewRecord(colorsCollection)
				newRecord.Set("name", color.Name)
				newRecord.Set("hex", color.Hex)
				if err := dao.SaveRecord(newRecord); err != nil {
					return err
				}
			}
		}

		return nil
	}, func(db dbx.Builder) error {
		// add down queries...

		return nil
	})
}
