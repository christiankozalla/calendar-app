package main

import (
	"log"
	"net/http"
	"os"

	"github.com/christiankozalla/calendar-app/dotenv"
	"github.com/christiankozalla/calendar-app/eventhandlers"

	_ "github.com/christiankozalla/calendar-app/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/pocketbase/pocketbase/tools/template"
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

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		JWT_SECRET := os.Getenv("JWT_SECRET")
		registry := template.NewRegistry()

		se.Router.GET("/signup", func(e *core.RequestEvent) error {
			token := e.Request.URL.Query().Get("token")

			/**
			 * 1. Verify the token (using Pocketbases utils and the SECRET)
			 * 2. decode and parse the token
			 * 3. use token data in the template to greet the user with as much information as possible
			 **/

			// relevant invite token claims
			//  "inviteeEmail"
			//  "inviterName"
			//  "inviterEmail"
			//  "inviterId"
			claims, err := security.ParseJWT(token, JWT_SECRET)

			if err != nil {
				// malformed or invalid JWT
				return e.BadRequestError(err.Error(), err)
			}
			inviteeEmail, ok := claims["inviteeEmail"].(string)
			if !ok {
				return e.BadRequestError("inviteeEmail claim does not exist", nil)
			}

			inviterEmail, ok := claims["inviterEmail"].(string)
			if !ok {
				return e.BadRequestError("inviterId claim does not exist", nil)
			}

			html, err := registry.LoadFiles(
				"views/layout.html",
				"views/signup.html",
			).Render(map[string]string{
				"inviterEmail": inviterEmail,
				"inviteeEmail": inviteeEmail,
			})

			if err != nil {
				return e.InternalServerError(err.Error(), err)
			}

			return e.HTML(http.StatusOK, html)
		})

		return se.Next()
	})

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		if !e.Router.HasRoute(http.MethodGet, "/{path...}") {
			e.Router.GET("/{path...}", apis.Static(os.DirFS("pb_public"), false))
		}

		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
