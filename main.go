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

	// indexFallback true is only needed when serving an SPA through pocketbase public directory. If the frontend is a React Native app, indexFallback is not needed.
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

	app.OnRecordCreateRequest("invitations").BindFunc(eventhandlers.OnBeforeCreateInvitation(app))
	app.OnRecordCreateRequest("users").BindFunc(eventhandlers.OnAfterUsersCreateHandleInvitation(app))

	app.OnRecordCreateRequest("events").BindFunc(eventhandlers.SanitizeDescriptionOnCreate)
	app.OnRecordUpdateRequest("events").BindFunc(eventhandlers.SanitizeDescriptionOnUpdate)

	// serves static files from the provided public dir (if exists)
	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		e.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), indexFallback))
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
