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

1. Remove react-native-ui-lib, write a custom button component.

2. Re-organize styles // https://totheroot.io/article/effective-styling-in-react-native

3. Write EventDetailPanel - display event data

4. use Touchable components from @gorhom/bottom-sheet

5. Chat feature !?


6. ConfigureCalendarPanel -> Move Delete Button to upper right corner as a small Trash/Bin icon! 


