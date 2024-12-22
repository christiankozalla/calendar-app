package eventhandlers

import (
	"github.com/microcosm-cc/bluemonday"
	"github.com/pocketbase/pocketbase/core"
)

var sanitizer = bluemonday.UGCPolicy()

func SanitizeDescriptionOnCreate(e *core.RecordRequestEvent) error {
	unsanitized := e.Record.GetString("description")
	sanitizedHtml := sanitizer.Sanitize(unsanitized)

	e.Record.Set("description", sanitizedHtml)

	return e.Next() // a "beforeCreate" hook needs to call e.Next
}

func SanitizeDescriptionOnUpdate(e *core.RecordRequestEvent) error {
	unsanitized := e.Record.GetString("description")
	sanitizedHtml := sanitizer.Sanitize(unsanitized)

	e.Record.Set("description", sanitizedHtml)

	return e.Next() // a "beforeUpdate" hook needs to call e.Next
}
