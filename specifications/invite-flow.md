# Invite Flow

The invite flow outlines the steps needed for one user, the inviting user, to invite another user, the invitee, to a calendar. During the flow a token needs to be shared between the inviting user and the invitee.

Free: Invitation should be done via a copyable/shareble link/url. The link more deeply trusted when delivered to the invitee direclty by the inviting user, over a well-known communication channel, such as a messenger.

Paid: Invitation may be sent out via email directly. Problem here is: How can the invitee trust this email (regarding scam, spam etc) without a personal message from the inviting user?!

> Watch out! It seems to be very complex to handle cross-platform installation sign up with invite token! iOS and Android have their special ways of dealing with retreiving data after a fresh app installation. Third party services use cookies (apparently Safari shares browsing context with web views) or fingerprinting based on IP address and geo-location etc (but I don't want to share this kind of sensitive data of my users with a third party carelessly). Additionally, a proper self-made implementatio will be complex to test!

## Simple flow with website handling first-time signup, then re-login after app installation

It is way simpler to send the user to a website using a universal link, if the user does not have the app installed.

Here is the flow:

1. Inviter generates invite link for invitee supplying invitee's email address.
2. Inviter sends invitee the link (via messenger app etc)
3. Invitee sees a website in theier browser
4. Website identifies the device the invitee is on.
5. Website says "Hello! You've been invited by {Inviter} to a calendar. Please sign up."
6. Invitee signs up.
7. Website generates App Store/Play Store link
8. Invitee downloads app, needs to login this time.
9. Eventually invitee verifys email address via verification link in email.


## Flow with self-implemented deferred deep links

A deep-link to the app only works if the invitee already has the app installed, which 99% of users do not. So we need to implement a flow that allows the invitee to visit a website and then will be redirected into the App Store/Play Store.

a) Inviting another user to my calendar via the user's email address. The user is not yet registered with Suntimes
    1. User signs up creating their person record and user record
    2. their user AND person records are added to the calendar!

b) Inviting a user by email address who is already registered with Suntimes, and has the app installed. -> Login signup page checks for token and if the user is logged in, the app shows a banner saying "hey you were invited to calendar XYZ by user ABC, do you want to join?" -> submits the token to the backend.

Alternative to b): If the inviting user references an email-address already known by the backend, then the invitee could be added directly to the calendar! But this will be without the consent of the invitee...

## Invitee without installed App

Often the invitee does not have the app installed, and has never been registered before.

### Invitee on iOS

the token can be passed from the website via "Smart App Banner" and then retrieved from within the app on fist launch.


### Invitee on Android

Use Play Store Referrer to pass invite token.