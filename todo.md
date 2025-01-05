# NOTES & LEARNINGS

## BottomSheet

- BottomSheetView sollte immer äußerstes Element einer Komponente sein, die in einen "BottomSheetContent - State" gesetzt wird, damit das dynamische Sizing funktioniert:

```
const [bottomSheetContent, setBottomSheetContent] = useState();

<BottomSheetModal>
    {bottomSheetContent} <-- Komponenten, die hier reingesetzt werden, müssen als äußerstes Element <BottomSheetView> haben!
</BottomSheetModal>
```

# TODO

1. A web-based login page only for invitees, so that they can sign-up before downloading the app
    - this feature will also remove the necesity of the app to deal with invitations
    - the web-based login page can be fully static and served by Pocketbase (i.e. from pb_public directory)


- Event Chat:
    - table Messages (id, eventId, authorId (userId))
    - each message references an event by id
    - when the Event Chat Overview, paginated (7 each page) events are fetched that:
        - have Messages
        - or have no Messages, so they are sorted by start date
        - sorted: have messages (sorted by message updated date), have no messages (sorted by event start date)

    - when an Event Chat (for a single event) is opened, the most recent messages are fetched and displayed in a chronological order, authors are marked obviously



2. Global error handler / screen


8. Calendar CRUD 
    - Users that do not have a calendar will be asked to create a calendar in a drawer and the asked to invite other people.
 

Migrate to React Native fully...

1. Remove react-native-ui-lib, write a custom button component. ::CHECK::
1.1 Create themed button - primary, secondary in sizes small and medium (secondary is "ghost" style)

2. Re-organize styles // https://totheroot.io/article/effective-styling-in-react-native

3. Write EventDetailPanel - display event data

4. use Touchable components from @gorhom/bottom-sheet

5. Chat feature !?


6. ConfigureCalendarPanel -> Move Delete Button to upper right corner as a small Trash/Bin icon!

## Virtual Persons

- Each user has their own virtual person, that is created implicitly and lives inside the Persons collection
- Solves problem: Virtual persons can be referenced by Events, users can only OWN Events!
- So, a user can decide whether they themselves want to take part in the event or not.

### Implementation

1. "After Create User" -> Create Person linked to user - each user has a Virtual Person, person has user_id fk field
2. A person that has a user_id is linked to a real user -> util function checks whether its the virtual person representing the current user
3. the virtual person of the user holds its profile information -> avatar, name, birthday. only email stays with `user`


## Invite Feature

### Key Tips for Success
 - Clear Call-to-Action in the Invitation: Ensure the invitation message clearly communicates the steps:
"You've been invited to join [App Name]! Tap the link below to download the app and accept your invitation."

### Fast Onboarding Flow: Keep the signup/login process short and simple. Offer features like:
- Social login (Google/Apple/Facebook).
- Pre-filling fields based on the invitation link.
- Deep Linking Testing: Thoroughly test deep linking to ensure the invite data flows correctly into the app.