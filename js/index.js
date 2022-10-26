const apiBasePath = 'https://www.vettix.org/uapi'

//Get button elements
const btnLogin = document.getElementById('btn-login')
//const btnGetSession = document.getElementById('btn-get-session')
const btnClearSession = document.getElementById('btn-clear-session')
const btnSearch = document.getElementById('btn-search')

//Get select elements for search
const selEventType = document.getElementById('select-event-type')
const selEventState = document.getElementById('select-event-state')
const selEventStatus = document.getElementById('select-event-status')
const selEventSort = document.getElementById('select-event-sort')

//Get input elements for login
const inputEmail = document.getElementById('email')
const inputApiKey = document.getElementById('apikey')

//Get table element for /event data
const tblEvents = document.getElementById('table-events')
const tblEventData = document.getElementById('table-event-data')  //tbody

//Add event listeners
btnLogin.addEventListener('click', loginClicked)
//btnGetSession.addEventListener('click', getSessionClicked)
btnClearSession.addEventListener('click', clearSessionClicked)
btnSearch.addEventListener('click', searchClicked)

//Functions to execute upon document load
showHideContainers()
loadSelectOptions()

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
function loadSelectOptions() {
    for (const event of eventTypes.list) {
        const element = document.createElement('option')
        element.value = event.ID
        element.text = event.name
        selEventType.appendChild(element)
    }
    for (const state of eventStates.list) {
        const element = document.createElement('option')
        element.value = state.code
        element.text = `(${state.code}) ${state.name}`
        selEventState.appendChild(element)
    }
    for (const status of eventStatus) {
        const element = document.createElement('option')
        element.value = status.value
        element.text = status.name
        selEventStatus.appendChild(element)
    }
    for (const searchSort of eventSort) {
        const element = document.createElement('option')
        element.value = searchSort.value
        element.text = searchSort.name
        selEventSort.appendChild(element) 
    }
}

/**
 * 
 * @param {*} eventsResponse 
 */

function parseEventData(eventsResponse) {
    tblEventData.innerHTML = ''
    if (eventsResponse.eventItems === undefined) {
        alert('Error parsing events response')
        return
    }   
    console.log(eventsResponse, eventsResponse.eventItems)
    for (var i=0; i<eventsResponse.eventItems.length; i++) {
        const eventItem = eventsResponse.eventItems[i]
        console.log(eventItem)
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
    }
    //tblEventData.insertRow()
}
/**
 * Perform the /event search
 * @param Number startNum 
 */
function performSearch(startNum = 1) {
    const xhr = new XMLHttpRequest()
    var params = `start=${startNum}`
    params += `&count=100`
    params += `&stateCode=${selEventState.value}`
    params += `&eventTypeID=${selEventType.value}`
    params += `&sortBy=${selEventSort.value}`
    params += `&eventStatus=${selEventStatus.value}`

    xhr.open("GET", apiBasePath + '/event?' + params, true)
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

function performLogout() {
    sessionStorage.removeItem('token')
    showHideContainers()
}
/**
 * Button click methods
 */
function searchClicked() {
    performSearch()
}

function loginClicked() {
    // Get email and api key inputs
    //alert(`Email: ${inputEmail.value} -> API Key: ${inputApiKey.value}`)

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
      }
    }

    //Process XHR request
    const formData = new FormData()
    formData.append('email', inputEmail.value)
    formData.append('password', inputApiKey.value)
    xhr.send(formData)
}

//check session data/token
function getSessionClicked() {
    const curr = currentToken()
    if (curr === null) {
        alert(`Not logged in`)
        return
    }
    alert(curr)
}

//Logout
function clearSessionClicked() {
    performLogout()
}