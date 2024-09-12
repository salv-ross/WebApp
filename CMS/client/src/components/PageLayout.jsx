import { React, useContext, useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { Link, useParams, useLocation, Outlet, useNavigate } from 'react-router-dom';

import PageForm from './PageForm';
import PageTable from './PageLibrary';
import { RouteFilters } from './Filters';
import API from './API';
import MessageContext from '../messageCtx';
import { LoginForm, LogoutForm, LogoutButton } from './Auth';
import { SinglePage } from './SinglePage';


function DefaultLayout(props) {

  const location = useLocation();

  // if the page is saved (eventually modified) we return to the list of all pages, 
  // otherwise, if cancel is pressed, we go back to the previous location (given by the location state)
  const nextpage = location.state?.nextpage || '/';

  const { filterLabel } = useParams();
  const filterId = filterLabel || (location.pathname === "/" && 'filter-all');

  return (
    <div>
      <Row className="vh-100" background="white">

        <Col md={4} xl={3} bg="light" className="below-nav" id="left-sidebar">
          <RouteFilters items={props.filters} selected={filterId} />
        </Col>
        <Col md={8} xl={9} className="below-nav">
          <Outlet />
        </Col>
      </Row>
    </div>
  );

}

function MainLayout(props) {

  const dirty = props.dirty;
  const setDirty = props.setDirty;
  const location = useLocation();
  const loggedIn = props.loggedIn;
  const { handleErrors } = useContext(MessageContext);
  let pages = props.pages;
  const setPages = props.setPages;
  const { filterLabel } = useParams();
  const filterName = props.filters[filterLabel] ? props.filters[filterLabel].label : 'All';
  const filterId = filterLabel || (location.pathname === "/" && 'filter-all');

  // Without this we do not pass the if(dirty) test in the [filterId, dirty] useEffect
  useEffect(() => {
    setDirty(true);
  }, [filterId])

  useEffect(() => {
    if (dirty) {
      API.getPages(filterId)
        .then(pages => {
          setPages(pages);
          setDirty(false);
        })
        .catch(e => {
          handleErrors(e); setDirty(false);
        });
    }
  }, [filterId, dirty]);

  const deletePage = (pageId) => {
    API.deletePage(pageId)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e));
  }

  // update a film into the list
  const updatePage = (page) => {
    API.updatePage(page)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e));
  }

  // update block into the list
  const createBlock = (block) => {
    API.createBlock(block)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e));
  }

  return (
    <>
    
      {props.loggedIn === true && <h2>Welcome, {props.user.name}!</h2>}
      {props.loggedIn === true && props.admin === true && <h3>You're an admin, feel free to do everything!</h3>}
      {props.admin === true &&
        <Link className="btn btn-danger btn-lg fixed-left-bottom" to="/editName" state={{ nextpage: location.pathname }}> Change website name</Link>}

      <PageTable admin={props.admin} user={props.user} filterName={filterName} loggedIn={loggedIn} />
      {props.loggedIn === true &&
        <Link className="btn btn-primary btn-lg fixed-right-bottom" to="/add" state={{ nextpage: location.pathname }}> &#43;</Link>}
      
    </>
  )
}

function SinglePageLayout(props) {

  const dirty = props.dirty;
  const setDirty = props.setDirty;
  const location = useLocation();
  const { handleErrors } = useContext(MessageContext);
  const { pageId } = useParams();
  const { filterLabel } = useParams();
  const filterId = filterLabel || (location.pathname === "/" && 'filter-all');

  const page = props.page;
  const setPage = props.setPage;
  // Without this we do not pass the if(dirty) test in the [filterId, dirty] useEffect
  useEffect(() => {
    setDirty(true);
  }, [pageId])

  useEffect(() => {
    if (dirty) {
      API.getPage(pageId)
        .then(page => {
          setPage(page);
          setDirty(false);
        })
        .catch(e => {
          handleErrors(e); setDirty(false);
        });
    }
  }, [pageId, dirty]);

  return (
    <>
      {page !== null && <><h1 className="pb-3"  >{page.title}</h1>
        <h4>Page written by: {page.author}</h4>
        <div style={{ marginTop: '30px' }}></div>
        <SinglePage page={page} pageId={pageId} />
        <Link className="btn btn-primary btn-lg fixed-right-bottom" to="/add" state={{ nextpage: location.pathname }}> &#43; </Link></>}
      {page === null && <h1>Page not found</h1>}
    </>
  )
}

function AddLayout(props) {
  const { handleErrors } = useContext(MessageContext);

  const user = props.user;
  // add a page into the list
  const addPage = (page, blocks) => {
    // adding page to the database
    API.addPage({page : page, user : props.user, blocks: blocks}).then(new_page => {
       //     setDirty(true);
    });
  }

  const deleteBlocks = (id) => {
    API.deleteBlocks(id).then(() => {
      console.log("Blocks deleted successfully");
    }).catch(e => handleErrors(e));
  }

  return (
    <PageForm addPage={addPage} deleteBlocks={deleteBlocks} user={props.user} admin={props.admin} setAdmin={props.setAdmin} />
  );
}

function EditLayout(props) {

  const dirty = props.dirty;
  const setDirty = props.setDirty;
  const { handleErrors } = useContext(MessageContext);
  const [blocks, setBlocks] = useState(null);
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [listDeleted, setListDeleted] = useState([]);

  // update block into the list
  const createBlock = (block) => {
    API.createBlock(block)
      .then(() => { setDirty(true); })
      .catch(e => handleErrors(e));
  }

  const addPage = (page, blocks) => {
    API.addPage({page : page, user : props.user, blocks: blocks}).then(new_page => {
      setDirty(true);
    });
  }

  // rendered only first time
  useEffect(() => {
    // retrieves blocks to display in the edit layout
    API.getBlocks(pageId)
      .then((blocks) => {
        setBlocks(JSON.parse(blocks));
      })
      .catch((err) => { console.log(err) });
  }, []);

  const deleteBlocks = (id) => {
    API.deleteBlocks(id).then(() => {
      console.log("Blocks deleted successfully");
    }).catch(e => handleErrors(e));
  }

  useEffect(() => {
    setDirty(true);
  }, [pageId])

  useEffect(() => {
    if (dirty) {
      API.getPage(pageId)
        .then(page => {
          setPage(page);
        })
        .catch(e => {
          handleErrors(e);
        });
      API.getBlocks(pageId)
        .then((blocks) => {
          setBlocks(JSON.parse(blocks));
        })
        .catch((err) => { console.log(err) });

      setDirty(false);
    }
  }, [pageId, dirty]);

  // update a page into the list
  const editPage = (page, blocks) => {
    API.updatePage({page : page, blocks : blocks}).then(new_page => {
            setDirty(true);
    });
  };

  return (
    <>
      {page !== null && <PageForm page={page} blocks={blocks} addPage={addPage} deleteBlocks={deleteBlocks} createBlock={createBlock} user={props.user} setPage={setPage} pageId={pageId} dirty={dirty} setDirty={setDirty} listDeleted={listDeleted} setListDeleted={setListDeleted} admin={props.admin} editPage={editPage} />}
      {page === null && <h1>Page not found :(</h1>}
    </>
  );

}

function EditNameLayout(props) {

  const location = useLocation();
  const nextpage = location.state?.nextpage || '/';

  const setDirty = props.setDirty;
  const [page, setPage] = useState(null);
  const navigate = useNavigate();
  const siteName = props.siteName;
  const setSiteName = props.setSiteName;
  const [websiteName, setWebsiteName] = useState(siteName);
  const [dirtyName, setDirtyName] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    API.setName({ name: websiteName, admin : props.admin }).then(name => {
      setDirtyName(true);
      setSiteName(websiteName);
    })
      .catch(e => {
        console.log(e);
      });

    setSiteName(event.target.value);
    navigate('/');
  }

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Change name of the website:</Form.Label>
        <Form.Control type="text" required={true} value={websiteName} onChange={event => setWebsiteName(event.target.value)} />
      </Form.Group>
      <Form.Group className="some-buttons">
        <Button className="mb-3" variant="primary" type="submit" onClick={(event) => handleSubmit(event)}>Update Name</Button>
        <Link className="btn btn-danger mb-3" to={nextpage}> Cancel </Link>
      </Form.Group>
    </>);

}

function NotFoundLayout() {
  return (
    <>
      <h2>This is not the route you are looking for!</h2>
      <Link to="/">
        <Button variant="primary">Go Home!</Button>
      </Link>
    </>
  );
}

/**
 * This layout shuld be rendered while we are waiting a response from the server.
 */
function LoadingLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={4} bg="light" className="below-nav" id="left-sidebar">
      </Col>
      <Col md={8} className="below-nav">
        <h1>CMSmall ...</h1>
      </Col>
    </Row>
  )
}

function LoginLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={12} className="below-nav">
        <>
          {!props.loggedin && <LoginForm login={props.login} loggedIn={props.loggedIn} admin={props.admin} setAdmin={props.setAdmin}></LoginForm>}
        </>
        <>
          {props.loggedin && <LogoutForm login={props.login} handleLogout={props.handleLogout} loggedIn={props.loggedIn} admin={props.admin} setAdmin={props.setAdmin}></LogoutForm>}
        </>
      </Col>
    </Row>
  );
}

function LogoutLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={12} className="below-nav">
        <LogoutForm login={props.login} loggedIn={props.loggedIn} handleLogout={props.handleLogout} admin={props.admin} setAdmin={props.setAdmin}></LogoutForm>
      </Col>
    </Row>
  );
}

export { DefaultLayout, AddLayout, EditLayout, EditNameLayout, NotFoundLayout, MainLayout, LoginLayout, LogoutLayout, LoadingLayout, SinglePageLayout }; 
