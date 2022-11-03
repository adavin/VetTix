class VetTix {
    constructor() {
        this.apiBasePath = 'https://www.vettix.org/uapi'

        //Get button elements
        this.btnLogin = document.getElementById('btn-login')
        this.btnClearSession = document.getElementById('btn-clear-session')
        this.btnSearch = document.getElementById('btn-search')
        this.btnSearchInventory = document.getElementById('btn-search-inventory')
        //Get select elements for search
        this.selEventType = document.getElementById('select-event-type')
        this.selEventState = document.getElementById('select-event-state')
        this.selEventStatus = document.getElementById('select-event-status')
        this.selEventSort = document.getElementById('select-event-sort')
        //Get input elements for login
        this.inputEmail = document.getElementById('email')
        this.inputApiKey = document.getElementById('apikey')
        //Get input elements for inventory check
        this.selInventoryEventId = document.getElementById('sel-inventory-event-id')
        this.inputInventoryTicketsWanted =  document.getElementById('inventory-tickets-wanted')
        //Get table element for /event data
        this.tblEvents = document.getElementById('table-events')
        this.tblEventData = document.getElementById('table-event-data')  //tbody
        //Add event listeners
        this.btnLogin.addEventListener('click', loginClicked)
        this.btnClearSession.addEventListener('click', clearSessionClicked)
        this.btnSearch.addEventListener('click', searchClicked)
        this.btnSearchInventory.addEventListener('click', searchInventoryClicked)

        //Functions to execute upon document load
        this.showHideContainers()
        this.loadEventTypes()
        this.loadStates()
    }
    /********************************
     * Begin custom functions/methods
    ********************************/
    /**
     * Gets the token for the current session
     * @returns string
     */
    currentToken() {
        return sessionStorage.getItem('token')
    }

    /**
     * Shows & Hides the login and tables for logged in data
     */
    showHideContainers() {
        const containerIds = ['container-login', 'container-data']
        for (const container of containerIds) {
            document.getElementById(container).style.display = 'none'
        }

        if (this.currentToken() === null) {
            document.getElementById('container-login').style.display = 'block' 
        } else {
            document.getElementById('container-data').style.display = 'block'
        }
    }

    /**
     * Populate the select dropdowns
     */
    loadEventTypes() {
        if (this.selEventType.children.length !== 1 || this.currentToken() === null) 
            return false
        const xhr = new XMLHttpRequest()
        xhr.open("GET", this.apiBasePath + '/event-type', true)
        xhr.setRequestHeader('Authorization', `Bearer ${this.currentToken()}`)
        xhr.onreadystatechange = () => { 
            if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
                const response = JSON.parse(xhr.responseText)
                if (response.errorCode !== undefined) {
                    if (response.errorCode === 'AUTHENTICATION_FAILED') {
                        this.clearSessionClicked()
                        this.showHideContainers()
                    }
                    alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                    return
                }
                for (const event of response.list) {
                    const element = document.createElement('option')
                    element.value = event.ID
                    element.text = event.name
                    this.selEventType.appendChild(element)
                }
            }
        }
        xhr.send()
    }

    /**
     * Load state dropdown
     * @returns
     */
    loadStates() {
        if (this.selEventState.children.length !== 1) 
            return false
        const xhr = new XMLHttpRequest()
        xhr.open("GET", this.apiBasePath + '/state', true)
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
                    this.selEventState.appendChild(element)
                }
            }
        }
        xhr.send()
    }

    /**
     * Parses the event data to table
     * @param {*} eventsResponse 
     */
    parseEventData(eventsResponse) {
        this.tblEventData.innerHTML = ''
        this.selInventoryEventId.innerHTML = ''
        if (eventsResponse.eventItems === undefined) {
            alert('Error parsing events response')
            return
        }   
        for (const eventItem of eventsResponse.eventItems) {
            //populate table -> event data
            const row = this.tblEventData.insertRow()
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

            //populate select -> inventory search -> event ids
            const element = document.createElement('option')
            element.value = eventItem.ID
            element.text = `(${eventItem.ID}) ${eventItem.title}`.replace('&#039;', "'")
            this.selInventoryEventId.appendChild(element)
        }
    }

    /** 
     *  Check inventory data for seat after lookup
     * @param {*} inventory 
     */
    parseInventoryData(inventory, wanted) {
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
    performInventorySearch() {
        const inventoryEventId = Number(this.selInventoryEventId.value)
        if (inventoryEventId <= 0) {
            alert('Please enter an Event ID')
            this.selInventoryEventId.focus()
            return
        }
        const ticketsWanted = Number(this.inputInventoryTicketsWanted.value)
        if (ticketsWanted <= 0) {
            alert('Please enter a number greater than 0')
            this.inputInventoryTicketsWanted.focus()
            return
        }
        const xhr = new XMLHttpRequest()
        xhr.open("GET", `${this.apiBasePath}/inventory/${inventoryEventId}`, true)
        xhr.setRequestHeader('Authorization', `Bearer ${this.currentToken()}`)
        xhr.onreadystatechange = () => { 
            if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
                const response = JSON.parse(xhr.responseText)
                if (response.errorCode !== undefined) {
                    if (response.errorCode === 'AUTHENTICATION_FAILED') {
                        this.clearSessionClicked()
                        this.showHideContainers()
                    }
                    alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                    return
                }
                this.parseInventoryData(response, ticketsWanted)
            }
        }
        xhr.send()
    }

    /**
     * Perform the /event search
     * @param Number startNum 
     */
    performSearch(startNum = 1, count=100) {
        var params = new URLSearchParams({'start': startNum,
        'count': count,
        'stateCode': this.selEventState.value,
        'eventTypeID': this.selEventType.value,
        'sortBy': this.selEventSort.value,
        'eventStatus': this.selEventStatus.value
        })
        const xhr = new XMLHttpRequest()
        xhr.open("GET", this.apiBasePath + '/event?' + params.toString(), true)
        xhr.setRequestHeader('Authorization', `Bearer ${this.currentToken()}`)
        xhr.onreadystatechange = () => { 
            if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
                const response = JSON.parse(xhr.responseText)
                if (response.errorCode !== undefined) {
                    if (response.errorCode === 'AUTHENTICATION_FAILED') {
                        this.clearSessionClicked()
                        this.showHideContainers()
                    }
                    alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
                    return
                }
                this.parseEventData(response)
            }
        }
        xhr.send()
    }

    /**
     * Perform logout
     */
    performLogout() {
        sessionStorage.removeItem('token')
        this.showHideContainers()
    }

    /**
     * Log a user in
     */
    performLogin() {
        // Process actual login request to API
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.apiBasePath + '/user/limited/login', true);
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
            this.showHideContainers()
            this.loadEventTypes()
        }
        }

        //Process XHR request
        const formData = new FormData()
        formData.append('email', this.inputEmail.value)
        formData.append('password', this.inputApiKey.value)
        xhr.send(formData)

    }
}


//Initialize new Class object
const VT = new VetTix()

/*******************************
 * 
 * Button click methods
 * 
 *******************************/
/**
 * Search button clicked
 */
function searchClicked() {
    VT.performSearch()
}

/**
 * Search Inventory button clicked
 */
function searchInventoryClicked() {
    VT.performInventorySearch()
}

/**
 * Login button clicked
 */
function loginClicked() {
    VT.performLogin()
}

/**
 * Logout button clicked
 */
function clearSessionClicked() {
    VT.performLogout()
}