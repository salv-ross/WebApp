import dayjs from 'dayjs';

import { Table, Form, Button } from 'react-bootstrap/'
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from './API';
import './PageLibrary.css'

export function PageTable(props) {

  let filteredPages = [];
  const [pages, setPages] = useState([]);
  const user = props.user;
  const admin = props.admin;
  const filterName = props.filterName;
  const loggedIn = props.loggedIn;

  const handleCancelPage = (id) => {

    // Call the API to delete the page with the given ID
    API.deletePage(id)
      .then(() => {
        // Handle successful deletion (e.g., show a success message, update state, etc.)
        console.log(`Page with ID ${id} has been deleted.`);
        setDirtyBlocks(true);
        API.deleteBlocks(id).then(() => {
          console.log('Also the blocks of page have been deleted');
        })
      })
      .catch((error) => {
        // Handle error (e.g., show an error message, handle error state, etc.)
        console.error(`Failed to delete page with ID ${id}. Error: ${error}`);
      });
  };

  const [dirtyBlocks, setDirtyBlocks] = useState();

  useEffect(() => {
    // get new pages
    API.getPages()
      .then(pages => {
        setPages(pages);
        setDirtyBlocks(false);
      })
      .catch(e => {
        console.log(e); setDirtyBlocks(false);
      });
  }, [dirtyBlocks]);

  if (pages.length === 0)
    return <p> There are no pages for the selected filter :( </p>

  else {
    if (filterName === "All" && loggedIn === true) {
      // all pages are displayed
      filteredPages = JSON.parse(pages);
    }
    else if (filterName === "All" && loggedIn === false) {
      // only published pages are displayed
      let parsed_pages = JSON.parse(pages);
      filteredPages = parsed_pages.filter((x) => { return x.publicationDate && dayjs(x.publicationDate).isBefore(dayjs(), 'day') });
    }
    else if (filterName === "myPages" && loggedIn === true) {
      // only mypages are displayed
      let parsed_pages = JSON.parse(pages);
      filteredPages = parsed_pages.filter((x) => { return x.author === user.name });
    }
  }
  return (
    <div>

      {!loggedIn && filterName === "myPages" ? (<h2>You have to be logged in to see your pages :(</h2>)
        : (
          // Content to display when loggedIn is false

          <Table striped>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Title</th>
                <th>Author</th>
                <th>Creation Date</th>
                <th>Publication Date</th>
              </tr>
            </thead>
            <tbody>{filteredPages.map((page) => <PageRow
              key={page.id}
              pageData={page}
              admin={admin}
              filterName={filterName}
              handleCancelPage={handleCancelPage}
            />)
            }
            </tbody>
          </Table>
        )}

    </div>
  );
}

function PageRow(props) {

  // location is used to pass state to the edit (or add) view so that we may be able to come back to the last filter view
  const location = useLocation();

  return (
    <tr>
      <td>
        <Link className="btn btn-primary" to={"/read/" + props.pageData.id} state={{ nextpage: location.pathname }}> Read  </Link>
      </td>

      <td>
        {(props.filterName === "myPages" || props.admin === true) && < Button className="btn red-link" onClick={() => props.handleCancelPage(props.pageData.id)}>
          <i className="bi bi-trash" />
        </Button>}
      </td>

      <td>{(props.filterName === "myPages" || props.admin === true) && <Link className="btn btn-primary" to={"/edit/" + props.pageData.id} state={{ nextpage: location.pathname }}>
        <i className="bi bi-pencil-square" />
      </Link>}</td>
      <td>
        <p className="text"> {props.pageData.title}
        </p>
      </td>
      <td>
        <p className="text"> {props.pageData.author}
        </p>
      </td>
      <td>
        <p> <small>{props.pageData.creationDate}</small>
        </p>
      </td>
      <td>
        <p> <small>{props.pageData.publicationDate}</small>
        </p>
      </td>
    </tr>

  );
}

export default PageTable;
