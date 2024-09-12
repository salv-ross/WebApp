const SERVER_URL = 'http://localhost:3001/api/';


/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

          // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
          response.json()
            .then(json => resolve(json))
            .catch(err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj =>
              reject(obj)
            ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err =>
        reject({ error: "Cannot communicate" })
      ) // connection error
  });
}

const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
};

/**
 * Getting from the server side and returning the list of pages.
 * The list of pages could be filtered in the server-side through the optional parameter: filter.
 */
const getPages = async () => {
  return getJson(
    fetch(SERVER_URL + 'pages/',
      { credentials: 'include' })
  ).then(json => {
    return JSON.stringify(json);
  })
}

// Getting blocks
const getBlocks = async (id) => {
  return getJson(fetch(SERVER_URL + 'blocks/' + id, { credentials: 'include' })
  ).then(json => {
    return JSON.stringify(json);
  })
}

/**
 * Getting and returing a page, specifying its pageId.
 */
const getPage = async (pageId) => {
  return getJson(fetch(SERVER_URL + 'pages/' + pageId, { credentials: 'include' }))
    .then(page => {
      const myPage = {
        id: page.id,
        title: page.title,
        author: page.author,
        creationDate: page.creationDate,
        publicationDate: page.publicationDate,
      }
      return myPage;
    })
}

// get current name of the website
const getName = async () => {
  return getJson(fetch(SERVER_URL + 'name/', { credentials: 'include' }))
    .then(name => {
      return name;
    })
}

// set new name of the website with parameter name
const setName = async (name, admin) => {
  
  return getJson(
    fetch(SERVER_URL + "name/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(name, admin),
    })
  )
    .then(page => {
      return page;
    })
}

/**
 * This function wants a page object as parameter. If the pageId exists, it updates the page in the server side.
 */
function updatePage(page) {

  return getJson(
    fetch(SERVER_URL + "pages/" + page.page.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(page) // dayjs date is serialized correctly by the .toJSON method override
    })
  )
}

/**
 * This funciton adds a new page in the back-end library.
 */
function addPage(page) {
  if(page.user.role === 'Admin' || page.author === page.user.name) {
    return getJson(
    fetch(SERVER_URL + "pages/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(page),
    })
  )
  }
  else {
    res.status(401).json({message : "unauthorized"});
  }
}

// create single block 
function createBlocks(block) {
  return getJson(
    fetch(SERVER_URL + "blocks/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(block)
    })
  )
}

// delete block
function deleteBlocks(id) {
  return getJson(
    fetch(SERVER_URL + "blocks/" + id, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}

/**
 * This function deletes a page from the back-end library.
 */
function deletePage(pageId) {
  return getJson(
    fetch(SERVER_URL + "pages/" + pageId, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}

const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}

const API = { getPages, getUserInfo, logOut, createBlocks, deleteBlocks, getBlocks, getPage, getName, setName, addPage, deletePage, updatePage, logIn };
export default API;
