var config = {
    // Lenguage for the mirror (currently not implemented)
    lenguage : "en",
    greeting : ["Hi James"], // An array of greetings to randomly choose from
    // forcast.io
    forcast : {
        key : "597e0497474862341df6133399876c5b", // Your forcast.io api key
        units : "auto" // See forcast.io documentation if you are getting the wrong units
    },
    // Calendar (An array of iCals)
    calendar: {
      icals : ["https://calendar.google.com/calendar/ical/support%40kocoa.or.kr/public/basic.ics"],
      maxResults: 9, // Number of calender events to display (Defaults is 9)
      maxDays: 365 // Number of days to display (Default is one year)
    },
    traffic: {
      key : "AijFr6G8qf7W7FabTbwZMSCqLDHJYpUWLL2qd7GF5x5wxsVLp8Sa7PZXCghDnEmO", // Bing Maps API Key
      mode : "Driving", // Possibilities: Driving / Transit / Walking
      origin : "350 5th Ave, New York, NY 10118", // Start of your trip. Human readable address.
      destination : "1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102", // Destination of your trip. Human readable address.
      name : "work", // Name of your destination ex: "work"
      reload_interval : 5 // Number of minutes the information is refreshed
    }
}
