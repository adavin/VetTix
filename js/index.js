const apiBasePath = 'https://www.vettix.org/uapi'

//Get button elements
const btnLogin = document.getElementById('btn-login')
const btnClearSession = document.getElementById('btn-clear-session')
const btnSearch = document.getElementById('btn-search')
const btnSearchInventory = document.getElementById('btn-search-inventory')
//Get select elements for search
const selEventType = document.getElementById('select-event-type')
const selEventState = document.getElementById('select-event-state')
const selEventStatus = document.getElementById('select-event-status')
const selEventSort = document.getElementById('select-event-sort')
//Get input elements for login
const inputEmail = document.getElementById('email')
const inputApiKey = document.getElementById('apikey')
//Get input elements for inventory check
const inputInventoryEventId = document.getElementById('inventory-event-id')
const inputInventoryTicketsWanted =  document.getElementById('inventory-tickets-wanted')
//Get table element for /event data
const tblEvents = document.getElementById('table-events')
const tblEventData = document.getElementById('table-event-data')  //tbody

//Add event listeners
btnLogin.addEventListener('click', loginClicked)
btnClearSession.addEventListener('click', clearSessionClicked)
btnSearch.addEventListener('click', searchClicked)
btnSearchInventory.addEventListener('click', searchInventoryClicked)

//Functions to execute upon document load
showHideContainers()
loadEventTypes()
loadStates()

/********************************
 * Begin custom functions/methods
********************************/
/**
 * Gets the token for the current session
 * @returns string
 */
 function currentToken() {
    return sessionStorage.getItem('token')
}

/**
 * Shows & Hides the login and tables for logged in data
 */
function showHideContainers() {
    const containerIds = ['container-login', 'container-data']
    for (const container of containerIds) {
        document.getElementById(container).style.display = 'none'
    }

    if (currentToken() === null) {
        document.getElementById('container-login').style.display = 'block' 
    } else {
        document.getElementById('container-data').style.display = 'block'
    }
}

/**
 * Populate the select dropdowns
 */
function loadEventTypes() {
    if (selEventType.children.length !== 1 || currentToken() === null) 
        return false
    const xhr = new XMLHttpRequest()
    xhr.open("GET", apiBasePath + '/event-type', true)
    xhr.setRequestHeader('Authorization', `Bearer ${currentToken()}`)
    xhr.onreadystatechange = () => { 
        if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
            const response = JSON.parse(xhr.responseText)
            if (response.errorCode !== undefined) {
                if (response.errorCode === 'AUTHENTICATION_FAILED') {
                    clearSessionClicked()
                    showHideContainers()
                }
                alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                return
            }
            for (const event of response.list) {
                const element = document.createElement('option')
                element.value = event.ID
                element.text = event.name
                selEventType.appendChild(element)
            }
        }
    }
    xhr.send()
}

/**
 * Load state dropdown
 * @returns
 */
function loadStates() {
    if (selEventState.children.length !== 1) 
        return false
    const xhr = new XMLHttpRequest()
    xhr.open("GET", apiBasePath + '/state', true)
    xhr.onreadystatechange = () => { 
        if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
            const response = JSON.parse(xhr.responseText)
            if (response.errorCode !== undefined) {
                alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                return
            }
            for (const state of response.list) {
                const element = document.createElement('option')
                element.value = state.code
                element.text = `(${state.code}) ${state.name}`
                selEventState.appendChild(element)
            }
        }
    }
    xhr.send()
}

/**
 * Parses the event data to table
 * @param {*} eventsResponse 
 */
function parseEventData(eventsResponse) {
    tblEventData.innerHTML = ''
    if (eventsResponse.eventItems === undefined) {
        alert('Error parsing events response')
        return
    }   
    //console.log(eventsResponse, eventsResponse.eventItems)
    for (const eventItem of eventsResponse.eventItems) {
        const row = tblEventData.insertRow()
        const img = document.createElement("img")
        img.src = eventItem.imageURL
        img.style.maxWidth = '50px'
        img.style.maxHeight = '50px'
        row.insertCell().appendChild(img)
        row.insertCell().innerHTML = eventItem.ID
        row.insertCell().innerHTML = eventItem.title
        row.insertCell().innerHTML = eventItem.eventType.name
        row.insertCell().innerHTML = eventItem.ticketsAvailable
        row.insertCell().innerHTML = eventItem.startDate
        row.insertCell().innerHTML = eventItem.startTime
    }
}

/** 
 *  Check inventory data for seat after lookup
 * @param {*} inventory 
 */
function parseInventoryData(inventory, wanted) {
    const seating = {}

    // convert data into a different format
    for (const seat of inventory) {
        if (seating[seat.section] === undefined) seating[seat.section] = {}
        if (seating[seat.section][seat.row] === undefined) seating[seat.section][seat.row] = []
        seating[seat.section][seat.row].push(Number(seat.seat))
    }

    // the fun part
    for (const section of Object.keys(seating)) {
        for (const row of Object.keys(seating[section])) {
            for (const seat of seating[section][row]) {
                if (seating[section][row].indexOf(seat - 1) !== -1) continue
                var enoughSeats = true
                for (let i=0; i<wanted; i++) {
                    if (seating[section][row].indexOf(seat + i) === -1) {
                        enoughSeats = false
                        break
                    }
                }
                if (enoughSeats) {
                    alert(`We found some tickets for you!\nSection: ${section} \nRow: ${row} \nSeats: ${seat}-${seat+wanted-1}`)
                    return
                }
            }
        }
    }
    alert(`Sorry, we were unable to find sufficient seating for your group`)
    //console.log(seating)
}

/**
 * Get inventory via /inventory/
 * @returns 
 */
function performInventorySearch() {
    const inventoryEventId = Number(inputInventoryEventId.value)
    if (inventoryEventId <= 0) {
        alert('Please enter an Event ID')
        inputInventoryEventId.focus()
        return
    }
    const ticketsWanted = Number(inputInventoryTicketsWanted.value)
    if (ticketsWanted <= 0) {
        alert('Please enter a number greater than 0')
        inputInventoryTicketsWanted.focus()
        return
    }
    const xhr = new XMLHttpRequest()
    xhr.open("GET", `${apiBasePath}/inventory/${inventoryEventId}`, true)
    xhr.setRequestHeader('Authorization', `Bearer ${currentToken()}`)
    xhr.onreadystatechange = () => { 
        if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
            const response = JSON.parse(xhr.responseText)
            if (response.errorCode !== undefined) {
                if (response.errorCode === 'AUTHENTICATION_FAILED') {
                    clearSessionClicked()
                    showHideContainers()
                }
                alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                return
            }
            parseInventoryData(response, ticketsWanted)
        }
    }
    xhr.send()
}

/**
 * Perform the /event search
 * @param Number startNum 
 */
function performSearch(startNum = 1, count=100) {
    var params = new URLSearchParams({'start': startNum,
    'count': count,
    'stateCode': selEventState.value,
    'eventTypeID': selEventType.value,
    'sortBy': selEventSort.value,
    'eventStatus': selEventStatus.value
    })
    const xhr = new XMLHttpRequest()
    xhr.open("GET", apiBasePath + '/event?' + params.toString(), true)
    xhr.setRequestHeader('Authorization', `Bearer ${currentToken()}`)
    xhr.onreadystatechange = () => { 
        if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
            const response = JSON.parse(xhr.responseText)
            if (response.errorCode !== undefined) {
                if (response.errorCode === 'AUTHENTICATION_FAILED') {
                    clearSessionClicked()
                    showHideContainers()
                }
                alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                return
            }
            parseEventData(response)
        }
    }
    xhr.send()
}

/**
 * Perform logout
 */
function performLogout() {
    sessionStorage.removeItem('token')
    showHideContainers()
}

/**
 * Log a user in
 */
function performLogin() {
    // Process actual login request to API
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiBasePath + '/user/limited/login', true);
    xhr.onreadystatechange = () => { 
      if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
        const response = JSON.parse(xhr.responseText)

        //Check response is valid and token isn't empty
        if (response.errorCode !== undefined) {
            alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
            return
        } 
        if (response.token === undefined || response.token === '') {
            alert('Error: token not found!')
            return
        }
        //Store token to session
        sessionStorage.setItem('token', response.token)
        showHideContainers()
        loadEventTypes()
      }
    }

    //Process XHR request
    const formData = new FormData()
    formData.append('email', inputEmail.value)
    formData.append('password', inputApiKey.value)
    xhr.send(formData)

}

/*******************************
 * Button click methods
 *******************************/

/**
 * Search button clicked
 */
function searchClicked() {
    performSearch()
}

/**
 * Search Inventory button clicked
 */
function searchInventoryClicked() {
    performInventorySearch()
}

/**
 * Login button clicked
 */
function loginClicked() {
    performLogin()
}

/**
 * Logout button clicked
 */
function clearSessionClicked() {
    performLogout()
}