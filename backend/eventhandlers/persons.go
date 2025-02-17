package eventhandlers

import (
	"github.com/pocketbase/pocketbase/core"
)

func OnAfterUsersCreateCreatePerson(e *core.RecordRequestEvent) error {
	// This is an OnAfter Hook, so we call Next first, which triggers the OnBefore hook
	if err := e.Next(); err != nil {
		return err
	}
	requestInfo, err := e.RequestInfo()

	if err != nil {
		e.App.Logger().Info("OnAfterUsersCreateCreatePerson", "err", err)
		return err
	}

	userId := e.Record.Id
	personsName := requestInfo.Body["name"] // if the end-user has not specified a name, personsName will be nil

	collection, err := e.App.FindCollectionByNameOrId("persons")
	if err != nil {
		return err
	}

	personsRecord := core.NewRecord(collection)
	personsRecord.Set("user", userId)
	personsRecord.Set("name", personsName)

	err = e.App.Save(personsRecord)
	if err != nil {
		return err
	}

	return e.Next()
}
