package eventhandlers

import (
	"github.com/microcosm-cc/bluemonday"
	"github.com/pocketbase/pocketbase/core"
)

var sanitizer = bluemonday.UGCPolicy()

func SanitizeDescriptionOnCreate(e *core.RecordCreateEvent) error {
	unsanitized := e.Record.GetString("description")
	sanitizedHtml := sanitizer.Sanitize(unsanitized)

	e.Record.Set("description", sanitizedHtml)

	return nil
}

func SanitizeDescriptionOnUpdate(e *core.RecordUpdateEvent) error {
	unsanitized := e.Record.GetString("description")
	sanitizedHtml := sanitizer.Sanitize(unsanitized)

	e.Record.Set("description", sanitizedHtml)

	return nil
}
