import './App.css'


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import React, { useContext, useState, useEffect } from 'react';
import { Container, Toast } from 'react-bootstrap/'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MainLayout, AddLayout, EditNameLayout, EditLayout, DefaultLayout, NotFoundLayout, LoginLayout, LogoutLayout, LoadingLayout, SinglePageLayout } from './components/PageLayout';
import API from './components/API';
import MessageContext from './messageCtx';
function App() {

  const [pages, setPages] = useState([])
  const [page, setPage] = useState([])
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState();
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [siteName, setSiteName] = useState();
  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); // WARN: a more complex application requires a queue of messages. In this example only last error is shown.
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo(); 
        setUser(user);
        setLoggedIn(true); setLoading(false);
        if (user === 'Admin') {
          setAdmin(true);
        }
      } catch (err) {
        handleErrors(err);
        setUser(null);
        setLoggedIn(false); setLoading(false);
      }
      API.getName().then((name) => { setSiteName(name) }).catch((err) => { console.error(err); });
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      if (user.role === 'Admin') {
        setAdmin(true);
      }
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      console.log('logout');
      await API.logOut();
      setLoggedIn(false);
      setAdmin(false);
      // clean up everything
      setUser(null);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  const filters = {
    'filter-all': { label: 'All', url: '', filterFunction: () => true },
    'filter-myPages': { label: 'myPages', url: '/filter/filter-myPages', filterFunction: page => page.author === username },
  };

  return (

    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
        <Container fluid className="App" style={{
          backgroundColor: 'white'
        }}>
          <Navigation logout={handleLogout} siteName={siteName} setSiteName={setSiteName} user={user} loggedIn={loggedIn} />
          <Routes>
            <Route path="/" element={loading ? <LoadingLayout /> : <DefaultLayout loggedIn={loggedIn} admin={admin} setAdmin={setAdmin} pages={pages} setPages={setPages} filters={filters} setLoggedIn={setLoggedIn} />} >
              <Route index element={<MainLayout admin={admin} user={user} setAdmin={setAdmin} username={username} setUsername={setUsername} password={password} setPassword={setPassword} pages={pages} setPages={setPages} dirty={dirty} setDirty={setDirty} loggedIn={loggedIn} setLoggedIn={setLoggedIn} filters={filters} />} />
              <Route path="editName" element={<EditNameLayout siteName={siteName} setSiteName={setSiteName} admin={admin} />} />
              <Route path="filter/:filterLabel" element={<MainLayout admin={admin} loggedIn={loggedIn} pages={pages} user={user} setFilms={setPages} filters={filters} dirty={dirty} setDirty={setDirty} />} />
              <Route path="read/:pageId" element={<SinglePageLayout admin={admin} setAdmin={setAdmin} username={username} setUsername={setUsername} message={message} page={page} setPage={setPage} pages={pages} setPages={setPages} dirty={dirty} setDirty={setDirty} />} />
              <Route path="add" element={<AddLayout user={user} admin={admin} setAdmin={setAdmin} />} />
              <Route path="edit/:pageId" element={<EditLayout user={user} pages={pages} admin={admin} dirty={dirty} setDirty={setDirty} />} />
              <Route path="*" element={<NotFoundLayout />} /> </Route>
            <Route path="/login" element={<LoginLayout admin={admin} setAdmin={setAdmin} login={handleLogin} loggedIn={loggedIn}></LoginLayout>} />
            <Route path="/logout" element={<LogoutLayout admin={admin} handleLogout={handleLogout} setAdmin={setAdmin} login={handleLogin} loggedIn={loggedIn}></LogoutLayout>} /></Routes>
          <Toast show={message !== ''} onClose={() => setMessage('')} delay={4000} autohide>
            <Toast.Body>{message.msg}</Toast.Body>
          </Toast>
        </Container>
      </MessageContext.Provider>
    </BrowserRouter>

  )
}

export default App
