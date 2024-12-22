package eventhandlers

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

func OnBeforeCreateInvitation(app *pocketbase.PocketBase) func(*core.RecordRequestEvent) error {
	JWT_SECRET := os.Getenv("JWT_SECRET")

	return func(e *core.RecordRequestEvent) error {
		inviter, err := app.FindRecordById("users", e.Record.GetString("inviter"))
		if err != nil {
			return err
		}

		token, err := security.NewJWT(
			jwt.MapClaims{
				"inviteeEmail": e.Record.GetString("invitee_email"),
				"inviterName":  inviter.GetString("name"),
				"inviterEmail": inviter.GetString("email"),
				"inviterId":    inviter.Id,
				"iat":          time.Now().Unix(),
			},
			JWT_SECRET,
			60*60*48,
		)

		if err != nil {
			return err
		}

		e.Record.Set("token", token)

		return e.Next()
	}
}

func OnAfterUsersCreateHandleInvitation(app *pocketbase.PocketBase) func(*core.RecordRequestEvent) error {
	JWT_SECRET := os.Getenv("JWT_SECRET")

	return func(e *core.RecordRequestEvent) error {
		// This is an OnAfter Hook, so we call Next first, which triggers the OnBefore hook
		if err := e.Next(); err != nil {
			return err
		}
		// inviteToken := e.HttpContext.QueryParam("token")
		inviteToken := e.Request.URL.Query().Get("token")

		if inviteToken == "" {
			// no token was sent - this hook has no work to do
			return nil
		}

		claims, err := security.ParseJWT(inviteToken, JWT_SECRET)

		// e.g. jwt.ErrTokenExpired, jwt.ErrTokenMalformed, jwt.ErrTokenSignatureInvalid
		if err != nil {
			return err
		}

		inviteeEmail, ok := claims["inviteeEmail"].(string)
		if !ok {
			return fmt.Errorf("inviteeEmail claim does not exist")
		}

		if ok && inviteeEmail != e.Record.Email() {
			return fmt.Errorf("email address of signing up user and intended invitee does not matchxx")
		}
		inviterId, ok := claims["inviterId"].(string)
		if !ok {
			return fmt.Errorf("inviterId claim does not exist")
		}
		invitationRecord, err := app.FindFirstRecordByFilter("invitations", "invitee_email = {:inviteeEmail} && inviter = {:inviterId}", dbx.Params{"inviteeEmail": inviteeEmail, "inviterId": inviterId})

		if err != nil {
			return err
		}
		calendarIds := invitationRecord.GetStringSlice("calendar")
		calendarRecords, err := app.FindRecordsByIds("calendars", calendarIds)
		if err != nil {
			return err
		}

		invitedUserId := e.Record.Id
		for _, calendarRecord := range calendarRecords {
			users := calendarRecord.GetStringSlice("users")
			users = append(users, invitedUserId)
			calendarRecord.Set("users", users)

			if err := app.Save(calendarRecord); err != nil {
				return err
			}
		}

		return nil
	}
}
