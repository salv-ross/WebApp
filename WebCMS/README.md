[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/8AapHqUJ)
# Exam #1: "CMSmall"
## Student: s317876 ROSSETTA SALVATORE FRANCESCO 

## React Client Application Routes

- Route `/`: home page with navbar and list of all pages
- Route `/editName`: form with a textbox to change website's name and a button to save it
- Route `/filter/:filterLabel`: showing pages published by user, :filterLabel used to filter
- Route `/read/:pageId`: reading a single page (the one with id "pageId")
- Route `/add`: form to create a new page
- Route `/edit/:pageId`: form to edit an existing page (with id "pageId")
- Route `/*`: "catch all" for any other route which is not correct
- Route `/login`: login form to authenticate user
- Route `/logout`: layout to confirm logout

## API Server
- POST `/api/sessions`
  - Description: authenticate an user
  - Request Body: (username, password), Request Parameters: None
  - Response Body: Object, representing the user
- GET `/api/sessions/current`
  - Description: check whether user is logged in
  - Request Body: isAuthenticated, Request Parameters: None
  - Response Body: Object, representing the user
- DELETE `/api/sessions/current`
  - Description: handle logout
  - Request Body: logout, Request Parameters: None
  - Response Body: None
- GET `/api/name`
  - Description: get the name of the website from the database
  - Request Body and Request Parameters: None
  - Response Body: Object with attribute "name"
- POST `/api/name`
  - Description: set the name of the website, saving it to the database
  - Request Body: "name", Request Parameters: None
  - Response Body: Object with attribute "name"
- GET `api/pages`
  - Description: set the name of the website, saving it to the database
  - Request Body and Request Parameters: None
  - Response Body: Array of Objects, each one describing one page
- GET `api/blocks/:id`
  - Description: get blocks belonging to a single page
  - Request Body: None, Request Parameters: "id"
  - Response Body: Array of Objects, each one describing one block belonging to page with identifier "id"
- GET `api/pages/:id`
  - Description: retrieves a single page with the "id" passed as parameter
  - Request Body: None, Request Parameters: "id"
  - Response Body: page with identifier "id"
- POST `api/pages`
  - Description: add a new page to the database, with attributes passed in the body
  - Request Body: (title, author, creationDate, publicationDate), Request Parameters: None
  - Response Body: Object, representing the new page 
- POST `api/blocks`
  - Description: add one of the blocks of a new or updated page to the database, with attributes in the body
  - Request Body: (type, content, position, page_fk), Request Parameters: None
  - Response Body: Object, representing the new block
- DELETE `api/blocks/:pageId`
  - Description: delete blocks belonging to a page
  - Request Body: None, Request Parameters: pageId
  - Response Body: None
- PUT `api/pages/:id`
  - Description: update an existing page
  - Request Body: (title, author, creationDate, publicationDate), Request Parameters: id
  - Response Body: Object, representing the updated page
- DELETE `api/pages/:id`
  - Description: delete a page
  - Request Body: None, Request Parameters: id
  - Response Body: None


## Database Tables

- Table `pages` - contains (id, title, author, creationDate, publicationDate)
- Table `users` - contains (id, email, name, role, hash, salt)
- Table `content_blocks` - contains (id, type, content, page_fk, position)
- Table `website_name` - contains (id, name)

## Main React Components
- `DefaultLayout` (in `PageLayout.jsx`): Layout with navbar and column of the left 
- `MainLayout` (in `PageLayout.jsx`): Layout to "home", with the list of all pages
- `EditNameLayout` (in `PageLayout.jsx`): Layout to change name of the website
- `SinglePageLayout` (in `PageLayout.jsx`): Layout to display one single page with all blocks
- `AddLayout` (in `PageLayout.jsx`): Layout with a form to create a new page
- `EditLayout` (in `PageLayout.jsx`): Layout to edit an existing page 
- `NotFoundLayout` (in `PageLayout.jsx`): Layout for incorrect paths
- `LoginLayout` (in `PageLayout.jsx`): Layout for inserting credentials
- `LogoutLayout` (in `PageLayout.jsx`): Layout for logout
- `PageForm` (in `PageForm.jsx`): Form with components such as boxes and buttons to insert a new page
- `PageTable` (in `PageLibrary.jsx`): Table to display pages, made as list of PageRows
- `PageRows` (in `PageLibrary.jsx`): Part of the above component to display one row
- `ImageBlock` (in `PageLibrary.jsx`): to display images and handling radio buttons

## Screenshot

![All Pages](https://github.com/polito-wa1-iz-2023-exams/exam1-cmsmall-taableside/blob/main/screenshots/allPages.png)


![New Page](https://github.com/polito-wa1-iz-2023-exams/exam1-cmsmall-taableside/blob/main/screenshots/creatingNewPage.png)


## Users Credentials

- username, password (plus any other requested info)
- (Admin) email: 'john@polito.it', password: 'password'
- (Admin) email: 'mario@gmail.com', password: 'password'
- (User) email: 'mark@gmail.com', password: 'password'
- (user) email: 'giulia@email.com', password: 'password'
