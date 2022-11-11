class VetTix {
    /********************************************************
     * Initialization
     *******************************************************/
    constructor() {
        this.apiBasePath = 'http://localhost/projects/vettix/eloquent/api/public/index.php'

        //Get select elements for search
        this.selEventType = $('#select-event-type')
        this.selEventState = $('#select-event-state')
        this.selEventStatus = $('#select-event-status')
        this.selEventSort = $('#select-event-sort')

        //Get input elements for inventory check
        this.selInventoryEventId = $('#sel-inventory-event-id')
        this.inputInventoryTicketsWanted = $('#inventory-tickets-wanted')

        //Get table element for /event data
        this.tblEvents = $('#table-events')
        this.tblEventData = $('#table-event-data')  //tbody

        //Functions to execute upon document load
        this.showHideContainers()
        this.loadEventTypes()
        this.loadStates()

        //Button click methods
        $('#btn-login').on('click', () => this.performLogin())
        $('#btn-clear-session').on('click', () => this.performLogout())
        $('#btn-search').on('click', () => this.performSearch())
        $('#btn-search-inventory').on('click', () => this.performInventorySearch())
    }

    /********************************
     * Begin custom functions/methods
    ********************************/
    /********************************************************
     * Gets the token for the current session
     * @returns string
     *******************************************************/
    currentToken() {
        return sessionStorage.getItem('token')
    }

    /********************************************************
     * Shows & Hides the login and tables for logged in data
     *******************************************************/
    showHideContainers() {
        const containerIds = ['container-login', 'container-data']
        for (const container of containerIds) {
            $(`#${container}`).hide()
        }
        if (this.currentToken() === null) {
            $(`#container-login`).show()
        } else {
            $(`#container-data`).show()
        }
    }

    /********************************************************
     * Populate the select dropdowns
     *******************************************************/
    loadEventTypes() {
/******************************************************
* Note: we use VT = this to reference the VetTix object
* from nested jQuery calls like .ajax/.post/.get 
******************************************************/
        const VT = this
        if (VT.selEventType.length !== 1 || VT.currentToken() === null) 
            return false

        $.post({
            headers: {Authorization: `Bearer ${VT.currentToken()}`},
            url: VT.apiBasePath,
            data: {
                action: 'event_types'
            }
        })
        .done(function(response) {
            VT.checkAuthFailed(response)
            for (const event of response.list) {
                const element = $('<option>')
                element.val(event.ID)
                element.text(event.name)
                VT.selEventType.append(element)
            }
        })
        .fail(function(xhr, status, error) {
            const response = xhr.responseJSON
            VT.checkAuthFailed(response)
        })

    }

    /********************************************************
     * Load state dropdown
     * @returns
     *******************************************************/
    loadStates() {
        const VT = this
        if (VT.selEventState.length !== 1) 
            return false

        $.post(VT.apiBasePath, {
            action: 'state'
        })
        .done(function(response) {
            for (const state of response.list) {
                const element = $('<option>')
                element.val(state.code)
                element.text(`(${state.code}) ${state.name}`)
                VT.selEventState.append(element)
            }
        })
        .fail(function(xhr, status, error) {
            const response = xhr.responseJSON
            VT.checkAuthFailed(response)
        })
    }

    /********************************************************
     * Parses the event data to table
     * @param {*} eventsResponse 
     *******************************************************/
    parseEventData(eventsResponse) {
        this.tblEventData.empty()
        this.selInventoryEventId.empty()
        if (eventsResponse.eventItems === undefined) {
            alert('Error parsing events response')
            return
        }   
        for (const eventItem of eventsResponse.eventItems) {
            const img = $('<img>')
            img.attr('src', eventItem.imageURL)
            img.css('max-width','50px')
            img.css('max-height', '50px')

            const row = $('<tr>')
            this.tblEventData.append(row)
            $(row).append($('<td>').append(img))
            .append($('<td>').append(eventItem.ID))
            .append($('<td>').append(eventItem.title))
            .append($('<td>').append(eventItem.eventType.name))
            .append($('<td>').append(eventItem.ticketsAvailable))
            .append($('<td>').append(eventItem.startDate))
            .append($('<td>').append(eventItem.startTime))

            //populate select -> inventory search -> event ids
            const element = $('<option>')
            element.val(eventItem.ID)
            element.text(`(${eventItem.ID}) ${eventItem.title}`.replace('&#039;', "'"))
            this.selInventoryEventId.append(element)
        }
    }

    /********************************************************
     *  Check inventory data for seat after lookup
     * @param {*} inventory 
     *******************************************************/
    parseInventoryData(inventory, wanted) {
        const seating = {}
        // convert data into a different format
        for (const seat of inventory) {
            if (seating[seat.section] === undefined) seating[seat.section] = {}
            if (seating[seat.section][seat.row] === undefined) seating[seat.section][seat.row] = []
            seating[seat.section][seat.row].push(Number(seat.seat))
        }
        // Loop -> section -> row -> seat
        for (const section of Object.keys(seating)) {
            for (const row of Object.keys(seating[section])) {
                for (const seat of seating[section][row]) {
                    //if this seat isn't the start of the sequence, go to top of loop (continue)
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
    }

    /********************************************************
     * Get inventory via /inventory/
     * @returns 
     *******************************************************/
    performInventorySearch() {
        const VT = this
        //Validate inputs
        const inventoryEventId = Number(VT.selInventoryEventId.val())
        if (inventoryEventId <= 0) {
            alert('Please enter an Event ID')
            VT.selInventoryEventId.focus()
            return
        }
        const ticketsWanted = Number(VT.inputInventoryTicketsWanted.val())
        if (ticketsWanted <= 0) {
            alert('Please enter a number greater than 0')
            VT.inputInventoryTicketsWanted.focus()
            return
        }

        //Send request
        $.post({
            headers: { Authorization: `Bearer ${VT.currentToken()}` },
            url: VT.apiBasePath, 
            data: {
                action: 'inventory',
                eventID: inventoryEventId
            }
        })
        .done(function(response) {
            VT.checkAuthFailed(response)
            VT.parseInventoryData(response, ticketsWanted)
        })
        .fail(function(xhr, status, error) {
            const response = xhr.responseJSON
            //Check response is valid and token isn't empty
            VT.checkAuthFailed(response)
        })
    }

    /********************************************************
     * Perform the /event search
     * @param Number startNum 
     *******************************************************/
    performSearch(startNum = 1, count=100) {
        const VT = this
        $.post({
            headers: { Authorization: `Bearer ${VT.currentToken()}` },
            url: VT.apiBasePath,
            data: {
                action: 'event',
                start: startNum,
                count: count,
                stateCode: VT.selEventState.val(),
                eventTypeID: VT.selEventType.val(),
                sortBy: VT.selEventSort.val(),
                eventStatus: VT.selEventStatus.val()
            }
        })
        .done(function(response) {
            VT.checkAuthFailed(response)
            VT.parseEventData(response)
        })
        .fail(function(xhr, status, error) {
            const response = xhr.responseJSON
            VT.checkAuthFailed(response)
        })
        return
    }

    /********************************************************
     * Log a user in
     *******************************************************/
    performLogin() {
        const VT = this
        $.post(VT.apiBasePath, { 
            action: 'login',
            email: $('#email').val(), 
            password: $('#apikey').val(),
        })
        .done(function(response) {
            //response = JSON.parse(response)
            if (VT.checkAuthFailed(response)) {
                sessionStorage.removeItem('token')
                return
            }  
            //Store token to session
            sessionStorage.setItem('token', response.token)
            VT.showHideContainers()
            VT.loadEventTypes()
        })
        .fail(function(xhr, status, error) {
            const response = xhr.responseJSON
            //Check response is valid and token isn't empty
            VT.checkAuthFailed(response)
        })
        return
    }

    /********************************************************
     * Perform logout
     *******************************************************/
    performLogout() {
        sessionStorage.removeItem('token')
        this.showHideContainers()
    }

    /********************************************************
     * Common error handling for responses
     * @param {}} response 
     *******************************************************/
    checkAuthFailed(response) {
        if (response.errorCode !== undefined) {
            alert(`Error Code -> ${response.errorCode} \nError Response -> ${response.message}`)
            if (response.errorCode === 'AUTHENTICATION_FAILED') {
                VT.performLogout()
                VT.showHideContainers()
                return true
            }
        }
        return false
    }
}

/*******************************************************
Initialize new Class object
*******************************************************/
const VT = new VetTix()



