package main

import (
	"log"
	"os"

	"github.com/christiankozalla/calendar-app/dotenv"
	"github.com/christiankozalla/calendar-app/eventhandlers"

	_ "github.com/christiankozalla/calendar-app/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	err := dotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		Automigrate: os.Getenv("AUTOMIGRATE") == "true",
	})

	app.OnRecordCreateRequest("invitations").BindFunc(eventhandlers.OnBeforeCreateInvitation(app))
	app.OnRecordCreateRequest("users").BindFunc(eventhandlers.OnAfterUsersCreateHandleInvitation(app))

	app.OnRecordCreateRequest("events").BindFunc(eventhandlers.SanitizeDescriptionOnCreate)
	app.OnRecordUpdateRequest("events").BindFunc(eventhandlers.SanitizeDescriptionOnUpdate)

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
