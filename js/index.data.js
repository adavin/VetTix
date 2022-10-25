const eventTypes = {
    "list": [
        {
            "ID": 42,
            "name": "Adult",
            "description": null
        },
        {
            "ID": 11,
            "name": "Arts",
            "description": null
        },
        {
            "ID": 7,
            "name": "Auto Racing",
            "description": null
        },
        {
            "ID": 34,
            "name": "Ballet",
            "description": null
        },
        {
            "ID": 2,
            "name": "Baseball",
            "description": null
        },
        {
            "ID": 3,
            "name": "Basketball",
            "description": null
        },
        {
            "ID": 13,
            "name": "Bowling",
            "description": null
        },
        {
            "ID": 6,
            "name": "Boxing",
            "description": null
        },
        {
            "ID": 40,
            "name": "Charity",
            "description": null
        },
        {
            "ID": 28,
            "name": "Circus",
            "description": null
        },
        {
            "ID": 27,
            "name": "Comedy",
            "description": null
        },
        {
            "ID": 16,
            "name": "Concerts",
            "description": null
        },
        {
            "ID": 12,
            "name": "Dance",
            "description": null
        },
        {
            "ID": 19,
            "name": "Dining",
            "description": null
        },
        {
            "ID": 37,
            "name": "Education",
            "description": null
        },
        {
            "ID": 18,
            "name": "Expo",
            "description": null
        },
        {
            "ID": 33,
            "name": "Family",
            "description": null
        },
        {
            "ID": 20,
            "name": "Festivals/Fairs",
            "description": null
        },
        {
            "ID": 36,
            "name": "Film",
            "description": null
        },
        {
            "ID": 14,
            "name": "Food",
            "description": null
        },
        {
            "ID": 1,
            "name": "Football",
            "description": null
        },
        {
            "ID": 5,
            "name": "Golf",
            "description": null
        },
        {
            "ID": 41,
            "name": "Haunted Attractions",
            "description": null
        },
        {
            "ID": 4,
            "name": "Hockey",
            "description": null
        },
        {
            "ID": 10,
            "name": "Horse Racing",
            "description": null
        },
        {
            "ID": 29,
            "name": "Lacrosse",
            "description": null
        },
        {
            "ID": 30,
            "name": "Military/First Responder Appreciation",
            "description": null
        },
        {
            "ID": 22,
            "name": "Mixed Martial Arts",
            "description": null
        },
        {
            "ID": 25,
            "name": "Monster Truck",
            "description": null
        },
        {
            "ID": 31,
            "name": "Motorcycle",
            "description": null
        },
        {
            "ID": 24,
            "name": "Musicals",
            "description": null
        },
        {
            "ID": 15,
            "name": "Poker",
            "description": null
        },
        {
            "ID": 32,
            "name": "Rodeo",
            "description": null
        },
        {
            "ID": 39,
            "name": "Roller Derby",
            "description": null
        },
        {
            "ID": 38,
            "name": "Skiing / Snowboarding",
            "description": null
        },
        {
            "ID": 9,
            "name": "Soccer",
            "description": null
        },
        {
            "ID": 8,
            "name": "Tennis",
            "description": null
        },
        {
            "ID": 17,
            "name": "Theater",
            "description": null
        },
        {
            "ID": 26,
            "name": "Travel",
            "description": null
        },
        {
            "ID": 23,
            "name": "Volleyball",
            "description": null
        },
        {
            "ID": 21,
            "name": "Wrestling",
            "description": null
        }
    ]
}

const eventStates = {"list":[{"ID":1,"code":"AL","name":"Alabama"},{"ID":2,"code":"AK","name":"Alaska"},{"ID":3,"code":"AZ","name":"Arizona"},{"ID":4,"code":"AR","name":"Arkansas"},{"ID":55,"code":"AA","name":"Armed Forces America"},{"ID":54,"code":"AE","name":"Armed Forces Europe"},{"ID":56,"code":"AP","name":"Armed Forces Pacific"},{"ID":5,"code":"CA","name":"California"},{"ID":6,"code":"CO","name":"Colorado"},{"ID":7,"code":"CT","name":"Connecticut"},{"ID":8,"code":"DE","name":"Delaware"},{"ID":9,"code":"DC","name":"District of Columbia"},{"ID":10,"code":"FL","name":"Florida"},{"ID":11,"code":"GA","name":"Georgia"},{"ID":59,"code":"GU","name":"Guam"},{"ID":12,"code":"HI","name":"Hawaii"},{"ID":13,"code":"ID","name":"Idaho"},{"ID":14,"code":"IL","name":"Illinois"},{"ID":15,"code":"IN","name":"Indiana"},{"ID":16,"code":"IA","name":"Iowa"},{"ID":17,"code":"KS","name":"Kansas"},{"ID":18,"code":"KY","name":"Kentucky"},{"ID":19,"code":"LA","name":"Louisiana"},{"ID":20,"code":"ME","name":"Maine"},{"ID":21,"code":"MD","name":"Maryland"},{"ID":22,"code":"MA","name":"Massachusetts"},{"ID":23,"code":"MI","name":"Michigan"},{"ID":24,"code":"MN","name":"Minnesota"},{"ID":25,"code":"MS","name":"Mississippi"},{"ID":26,"code":"MO","name":"Missouri"},{"ID":27,"code":"MT","name":"Montana"},{"ID":28,"code":"NE","name":"Nebraska"},{"ID":29,"code":"NV","name":"Nevada"},{"ID":30,"code":"NH","name":"New Hampshire"},{"ID":31,"code":"NJ","name":"New Jersey"},{"ID":32,"code":"NM","name":"New Mexico"},{"ID":33,"code":"NY","name":"New York"},{"ID":34,"code":"NC","name":"North Carolina"},{"ID":35,"code":"ND","name":"North Dakota"},{"ID":36,"code":"OH","name":"Ohio"},{"ID":37,"code":"OK","name":"Oklahoma"},{"ID":38,"code":"OR","name":"Oregon"},{"ID":39,"code":"PA","name":"Pennsylvania"},{"ID":52,"code":"PR","name":"Puerto Rico"},{"ID":40,"code":"RI","name":"Rhode Island"},{"ID":41,"code":"SC","name":"South Carolina"},{"ID":42,"code":"SD","name":"South Dakota"},{"ID":43,"code":"TN","name":"Tennessee"},{"ID":44,"code":"TX","name":"Texas"},{"ID":45,"code":"UT","name":"Utah"},{"ID":46,"code":"VT","name":"Vermont"},{"ID":53,"code":"VI","name":"Virgin Islands"},{"ID":47,"code":"VA","name":"Virginia"},{"ID":48,"code":"WA","name":"Washington"},{"ID":49,"code":"WV","name":"West Virginia"},{"ID":50,"code":"WI","name":"Wisconsin"},{"ID":51,"code":"WY","name":"Wyoming"}]}
const eventStatus = [{
    name: 'All Events',
    value: 'all'
}, 
{
    name: 'Open Events',
    value: 'open'
}, 
{
    name: 'Events in Lottery',
    value: 'lottery'
}, 
{
    name: 'First Come – First Serve',
    value: 'fcfs'
}]

const eventSort = [
    {
        name: 'Event Date (Soonest)',
        value: 'dateAscending'
    },
    {
        name: 'Event Date (Farthest)',
        value: 'dateDescending'
    },
    {
        name: 'Most Tickets Available',
        value: 'ticketsAvailableAscending'
    },
    {
        name: 'Least Tickets Available',
        value: 'ticketsAvailableDescending'
    },
    {
        name: 'Most Popular',
        value: 'popularity'
    },
    {
        name: 'Event Title (A-Z)',
        value: 'titleAscending'
    },
    {
        name: 'Event Title (Z-A)',
        value: 'titleDescending'
    },
]
/**
Query Parameter — How the event list should be sorted 
("dateAscending", "dateDescending", "ticketsAvailableAscending", "ticketsAvailableDescending", "popularity", "titleAscending", "titleDescending") 

s (“Event Date (Soonest)”, “Event Date
(Farthest)”, “Most Tickets Available”, “Least Tickets Available”, “Most Popular”, “Event Title (A-Z)”, “Event Title (Z-A)”).


 */

