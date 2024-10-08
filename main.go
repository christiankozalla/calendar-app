package main

import (
	"log"
	"os"

	"github.com/christiankozalla/calendar-app/dotenv"
	"github.com/christiankozalla/calendar-app/eventhandlers"
	_ "github.com/christiankozalla/calendar-app/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	err := dotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	app := pocketbase.New()

	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(
		&indexFallback,
		"indexFallback",
		true,
		"fallback the request to index.html on missing static path (eg. when pretty urls are used with SPA)",
	)

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		Automigrate: os.Getenv("AUTOMIGRATE") == "true",
	})

	app.OnRecordBeforeCreateRequest("invitations").Add(eventhandlers.OnBeforeCreateInvitation(app))
	app.OnRecordAfterCreateRequest("users").Add(eventhandlers.OnAfterUsersCreateHandleInvitation(app))

	app.OnRecordBeforeCreateRequest("events").Add(eventhandlers.SanitizeDescriptionOnCreate)
	app.OnRecordBeforeUpdateRequest("events").Add(eventhandlers.SanitizeDescriptionOnUpdate)

	// serves static files from the provided public dir (if exists)
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), indexFallback))
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
