const apiBasePath = 'https://www.vettix.org/uapi'

//Get button elements
const btnLogin = document.getElementById('btn-login')
const btnGetSession = document.getElementById('btn-get-session')
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

//Add event listeners
btnLogin.addEventListener('click', loginClicked)
btnGetSession.addEventListener('click', getSessionClicked)
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

function loadSelectOptions() {
    for (const event of eventTypes.list) {
        const element = document.createElement('option')
        element.value = event.ID
        element.text = event.name
        selEventType.appendChild(element)
    }
    for (const state of eventStates.list) {
        const element = document.createElement('option')
        element.value = state.ID
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
 * Button click methods
 */
function searchClicked() {
    /**
     * 
Query parameters
stateCode (optional)
Query Parameter — State code - "code" value from /state list
eventTypeID (optional)
Query Parameter — ID of specific event type to query ("id" value from /eventtype call)
sortBy (optional)
Query Parameter — How the event list should be sorted ("dateAscending", "dateDescending", "ticketsAvailableAscending", "ticketsAvailableDescending", "popularity", "titleAscending", "titleDescending")
start (required)
Query Parameter — Starting record number for paging
count (required)
Query Parameter — Number of records to retrieve for paging. May be further limited by server. Check response for actual value.
eventStatus (optional)
Query Parameter — Status of events to query ("open", "lottery", "fcfs", "all", "preferred"). Defaults to "all" if not specified.
     */
    const xhr = new XMLHttpRequest();
    var params = ''
    params += `start=1`
    params += `&count=100`
    params += `&stateCode=${selEventState.value}`

    xhr.open("GET", apiBasePath + '/event?' + params, true);
    xhr.setRequestHeader('Authorization', `Bearer ${currentToken()}`)
    xhr.onreadystatechange = () => { 
        if (xhr.readyState === XMLHttpRequest.DONE && [200, 401].indexOf(xhr.status) !== -1) {
            const response = JSON.parse(xhr.responseText)
            console.log(response)
        }
    }
    xhr.send()
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
    sessionStorage.removeItem('token')
    showHideContainers()
}