package migrations

import (
	"fmt"
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

type Color struct {
	Name string `json:"name"`
	Hex  string `json:"hex"`
}

func init() {
	m.Register(func(app core.App) error {
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
	{ "name": "Vibrant Purple", "hex": "#8E44AD" },

	{"name": "Apple", "hex": "#61BB46", "rgb": "97,187,70" },
	{"name": "Ripe Mango", "hex": "#FDB827", "rgb": "253,184,39" },
	{"name": "Princeton Orange", "hex": "#F5821F", "rgb": "245,130,31" },
	{"name": "Jasper", "hex": "#E03A3E", "rgb": "224,58,62" },
	{"name": "Plum", "hex": "#963D97", "rgb": "150,61,151" },
	{"name": "Rich Electric Blue", "hex": "#009DDC", "rgb": "0,157,220" }
]`

		colorsCollection, err := app.FindCollectionByNameOrId("colors")
		if err != nil {
			return err
		}

		var colors []Color
		err = json.Unmarshal([]byte(jsonColors), &colors)
		if err != nil {
			return err
		}

		for _, color := range colors {
			record, err := app.FindFirstRecordByData("colors", "hex", color.Hex)
			fmt.Println("Record", record)
			fmt.Println("Error", err)
			if err != nil || record == nil {
				// color does not exist yet
				newRecord := core.NewRecord(colorsCollection)
				newRecord.Set("name", color.Name)
				newRecord.Set("hex", color.Hex)
				if err := app.Save(newRecord); err != nil {
					return err
				}
			}
		}

		return nil
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
