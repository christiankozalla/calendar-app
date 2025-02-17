package eventhandlers

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

var JWT_SECRET = os.Getenv("JWT_SECRET")

// this hook creates a JWT token for an invitation before the invitation record is saved
func OnBeforeCreateInvitation(e *core.RecordRequestEvent) error {
	inviter, err := e.App.FindRecordById("users", e.Record.GetString("inviter"))
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
		48*time.Hour,
	)

	if err != nil {
		return err
	}

	e.Record.Set("token", token)

	return e.Next()
}

// after an invited user has signed up through an invitation link, this hook verifies the token and adds the user to the calendar
func OnAfterUsersCreateHandleInvitation(e *core.RecordRequestEvent) error {
	// This is an OnAfter Hook, so we call Next first, which triggers the OnBefore hook
	if err := e.Next(); err != nil {
		return err
	}

	inviteToken := e.Request.URL.Query().Get("token")

	if inviteToken == "" {
		// no token was sent - this hook has no work to do
		return e.Next()
	}

	claims, err := security.ParseJWT(inviteToken, JWT_SECRET)

	// e.g. jwt.ErrTokenExpired, jwt.ErrTokenMalformed, jwt.ErrTokenSignatureInvalid
	if err != nil {
		return err
	}

	inviteeEmail, ok := claims["inviteeEmail"].(string)
	if !ok {
		return fmt.Errorf("inviteeEmail claim does not exist")
	} else if inviteeEmail != e.Record.Email() {
		return fmt.Errorf("email address of signing up user and intended invitee do not match")
	}

	inviterId, ok := claims["inviterId"].(string)
	if !ok {
		return fmt.Errorf("inviterId claim does not exist")
	}

	invitationRecord, err := e.App.FindFirstRecordByFilter("invitations", "invitee_email = {:inviteeEmail} && inviter = {:inviterId}", dbx.Params{"inviteeEmail": inviteeEmail, "inviterId": inviterId})

	if err != nil {
		return err
	}
	calendarIds := invitationRecord.GetStringSlice("calendar")
	calendarRecords, err := e.App.FindRecordsByIds("calendars", calendarIds)
	if err != nil {
		return err
	}

	invitedUserId := e.Record.Id
	for _, calendarRecord := range calendarRecords {
		users := calendarRecord.GetStringSlice("users")
		users = append(users, invitedUserId)
		calendarRecord.Set("users", users)
		e.App.Logger().Debug("OnAfterUsersCreateHandleInvitation", "calendarRecord", calendarRecord)

		// this hook is executed after a user is created who comes with an invite token.
		// BUT this hook expects the user's person record to be available already, ALTHOUGH the userPerson is created independently AFTER user creation by the frontend <<-- big mistake! Create userPerson in the backend!
		userPerson, err := e.App.FindFirstRecordByFilter("persons", "user = {:userId}", dbx.Params{"userId": invitedUserId})

		if err != nil {
			e.App.Logger().Debug("OnAfterUsersCreateHandleInvitation querying userPerson", "error", err)
			return err
		}

		calendarRecord.Set("persons", append(calendarRecord.GetStringSlice("persons"), userPerson.Id))

		if err := e.App.Save(calendarRecord); err != nil {
			e.App.Logger().Debug("OnAfterUsersCreateHandleInvitation", "error", err)
			return err
		}
	}

	e.App.Logger().Info("OnAfterUsersCreateHandleInvitation successfully added user to calendar(s)", "invitedUserId", invitedUserId, "calendarIds", calendarIds)

	// delete the invitation record
	if err := e.App.Delete(invitationRecord); err != nil {
		return err
	}

	e.App.Logger().Info("OnAfterUsersCreateHandleInvitation successfully deleted invitation record", "invitationRecord", invitationRecord)

	return e.Next()
}
