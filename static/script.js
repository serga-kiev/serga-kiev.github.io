const CLIENT_ID = '1071300730927-8t3gsatpv91t638e7hmockmc8m98u3fr.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBe3NJlrHx6lTXCzSg2G4JrAW-81m8aKLA';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');

// Clear works only on Primary calendar
const CALENDAR_ID = 'primary';
//const CALENDAR_ID = 'rp845cv9lhvntohjigteblirpk@group.calendar.google.com';

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function handleClearAll() {
    const clearBtn = document.getElementById('clear-calendar');
    clearBtn.disabled = true;

    gapi.client.calendar.calendars.clear({
        'calendarId': CALENDAR_ID
    }).then(response => {
        clearBtn.disabled = false;
        document.getElementById('content').innerHTML = '';
        console.log(response);
    })
}

function handleAddEvent() {
    createEventReoccurrences(document.getElementById('event-name').value);
}

function createEventReoccurrences(text = 'dont forget!') {
    // 20m, 8h, 1d, 2w, 2m
    const occurSeries = [
        20,
        8 * 60,
        24 * 60,
        2 * 7 * 24 * 60,
        2 * 30 * 24 * 60
    ];
    let firstOccurTime = new Date();

    occurSeries.forEach((value, index) => {
        const delay = 200; // delay to avoid api limits
        setTimeout(
            () => createNewEvent(text, new Date().setMinutes(firstOccurTime.getMinutes() + value)),
            (index + 1) * delay);
    });
}

function createNewEvent(text, start) {
    const event = {
        'summary': text,
        'start': {
            'dateTime': new Date(start).toISOString(),
            'timeZone': 'Europe/Kiev'
        },
        'end': {
            'dateTime': new Date(start).toISOString(),
            'timeZone': 'Europe/Kiev'
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'popup', 'minutes': 1}
            ]
        }
    };

    let request = gapi.client.calendar.events.insert({
        'calendarId': CALENDAR_ID,
        'resource': event
    });

    request.execute(function (event) {
        appendPre('');
        appendPre('Event created: ' + event.start.dateTime);
    });
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';

        setInputsDisabled(false);
        // list all calendars
        //gapi.client.calendar.calendarList.list().then(value => console.log(value));
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    setInputsDisabled(true);
    gapi.auth2.getAuthInstance().signOut();
}

function appendPre(message) {
    const pre = document.getElementById('content');
    const textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function setInputsDisabled(disable) {
    document.getElementById('event-name').disabled = disable;
    document.getElementById('add-event').disabled = disable;
    document.getElementById('clear-calendar').disabled = disable;
}
