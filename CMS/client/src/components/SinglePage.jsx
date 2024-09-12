import 'dayjs';
import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { useParams, Outlet } from 'react-router-dom';

import { Table, Form, Button } from 'react-bootstrap/'
import { Link, useLocation } from 'react-router-dom';
import API from './API';

export function SinglePage(props) {

  const myPage = props.page;
  const pageId = useParams();

  const [parsedBlocks, setParsedBlocks] = useState(null);
  // retrieve all blocks with myPage.id as foreign key
  useEffect(() => {
    API.getBlocks(myPage.id)
      .then((blocks) => {
        setParsedBlocks(JSON.parse(blocks));
      })
      .catch((err) => console.log(err));
  }, [myPage.id]);

  return (
    // display the page
    <>
      {parsedBlocks && <div>
        <h1>{parsedBlocks.author}</h1>
        <div>
          {parsedBlocks.map((block, index) => {
            if (block.type === 'header') {
              return <h2 key={index}>{block.content}</h2>;
            } else if (block.type === 'paragraph') {
              return <p key={index}>{block.content}</p>;
            } else if (block.type === 'image') {
              return <div><div><img key={index} src={block.content} style={{ width: '480px', height: 'auto' }} alt="Content Block" /></div>
                <div style={{ marginTop: '20px' }}></div></div>;
            } 
          })}
        </div>
      </div>}
      {!parsedBlocks && <div><h1>There are no pages :(</h1></div>}
    </>
  );
}

export default SinglePage;
