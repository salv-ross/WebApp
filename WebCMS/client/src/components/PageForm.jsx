import dayjs from 'dayjs';
import './PageForm.css'
import { useState, useEffect, useContext } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import API from './API';
const PageForm = (props) => {
  /*
   * Creating a state for each parameter of the page.
   * There are two possible cases: 
   * - if we are creating a new page, the form is initialized with the default values.
   * - if we are editing a page, the form is pre-filled with the previous values.
   */
  const [title, setTitle] = useState(props.page ? props.page.title : '');
  const [author, setAuthor] = useState(props.page ? props.page.author : (props.user ? props.user.name : "Anonymous"));
  const [creationDate, setCreationDate] = useState(props.page ? props.page.creationDate : dayjs().format('YYYY-MM-DD'));
  const [publicationDate, setPublicationDate] = useState(props.page && props.page.publicationDate !== null ? dayjs(props.page.publicationDate).format('YYYY-MM-DD') : null);

  // content of headers and paragraph to be added
  const [content, setContent] = useState('');
  const page = props.page;
  const setPage = props.setPage;
  const { pageId } = useState(props.page ? props.page.id : '0');
  const [blocks, setBlocks] = useState(props.blocks ? props.blocks : []);
  const admin = props.admin;
  const deleteBlocks = props.deleteBlocks;
  const editPage = props.editPage;

  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [errorMessageDate, setErrorMessageDate] = useState('');
  // dirty states to avoid infinite re renders
  const [dirty, setDirty] = useState();
  const [dirtyUpdate, setDirtyUpdate] = useState();
  // useNavigate hook is necessary to change page
  const navigate = useNavigate();
  const location = useLocation();
  // if the page is saved (eventually modified) we return to the list of all pages, 
  // otherwise, if cancel is pressed, we go back to the previous location (given by the location state)
  const nextpage = location.state?.nextpage || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();

    const new_page = {
      "title": title.trim(),
      "author": author,
      "creationDate": creationDate,
      "publicationDate": (publicationDate !== null && publicationDate !== '') ? dayjs(publicationDate).format('YYYY-MM-DD') : null,
    };

    const headers = blocks.filter((x) => x.type === 'header').length;
    const body = blocks.filter((x) => x.type !== 'header').length;
    console.log(new_page.publicationDate);
    if(new_page.publicationDate === null || new_page.publicationDate === '' || !dayjs(new_page.creationDate).isAfter(new_page.publicationDate)) {
    if (headers >= 1 && body >= 1) {
      if (props.page) {
        // update existing page
        new_page.id = page.id;
        console.log("Calling editPage in Pageform...");
        editPage(new_page, blocks); // also adds blocks
      }
      else {
        // new page
        props.addPage(new_page, blocks);
      }
      navigate('/');
    }
    else {
      setErrorMessage("Note: at least one header and one of the other two blocks is required."); setShow(true);
    }
    }
    else {
      setErrorMessageDate("Publication date must be after creation date."); setShowDate(true);
    }
  }

  useEffect(() => {
    setDirty(true);
  }, [pageId])

  useEffect(() => {
    if (dirty) {
      /*  API.getPage(pageId)
          .then(page => {
            setPage(page);
          })
          .catch(e => {
            console.log(e);
          });
          setDirty(false);*/
    }
  }, [pageId, dirty]);

  // updated blocks
  const [newBlockContent, setNewBlockContent] = useState("");

  const { Pageid } = useParams();

  useEffect(() => {
    setNewBlockContent([...blocks]);
    setDirtyUpdate(false);
  }, [Pageid, dirtyUpdate]);

  // keeps track of the radio button selected
  const [selected, setSelected] = useState('image1');

  // when adding new blocks not showing "Save Page" and "Cancel" buttons
  const [activeButton, setActiveButton] = useState(null);

  // cancels 1 block and updates position/index of remaining
  const handleCancelBlock = (index) => {

    const updatedBlocks = blocks.filter(block => block.position !== index);
    const mappedBlocks = updatedBlocks.map((x) => { if (x.position > index) { return { ...x, position: x.position - 1 }; } return x; });
    setBlocks(mappedBlocks);
    setDirtyUpdate(true);
  };

  // add header block
  const handleAddHeader = (index) => {
    if (content.trim() !== "") {
      const newBlock = {
        type: "header",
        position: blocks.length,
        content: newBlockContent
      };
      setBlocks([...blocks, newBlock]);
      setNewBlockContent('');
      setActiveButton(false);
      setContent('');
    }
    setActiveButton(false);
  };

  // add paragraph block
  const handleAddParagraph = () => {
    if (content.trim() !== "") {
      const newBlock = {
        type: "paragraph",
        position: blocks.length,
        content: newBlockContent
      };
      setBlocks([...blocks, newBlock]);
      setNewBlockContent('');
      setActiveButton(false);
      setContent('');
    }
    setActiveButton(false);
  };

  // add image block
  const handleAddImage = (selected) => {
    let src = "";
    if (selected === 'image1') src = "../../images/image1.jpg";
    if (selected === "image2") src = "../../images/image2.jpg";
    if (selected === "image3") src = "../../images/image3.jpg";
    if (selected === "image4") src = "../../images/image4.jpg";
    const newBlock = {
      type: "image",
      position: blocks.length,
      content: src
    };
    setBlocks([...blocks, newBlock]);
    setNewBlockContent('');
    setActiveButton(false);

  };

  const BlockUp = (index) => {
    if (index > 0) {
      const newBlocks = [...blocks];
      const temp = newBlocks[index - 1];
      newBlocks[index].position = index - 1;
      temp.position = index;
      newBlocks[index - 1] = newBlocks[index];
      newBlocks[index] = temp;
      setBlocks(newBlocks);
    }
  };

  const BlockDown = (index) => {
    if (index < blocks.length - 1) {
      const newBlocks = [...blocks];
      const temp = newBlocks[index + 1];
      newBlocks[index].position = index + 1;
      temp.position = index;
      newBlocks[index + 1] = newBlocks[index];
      newBlocks[index] = temp;
      setBlocks(newBlocks);
    }
  };

  return (
    <>
      <Alert
        dismissible
        show={show}
        onClose={() => setShow(false)}
        variant="danger">
        {errorMessage}
      </Alert>
      <Alert
        dismissible
        show={showDate}
        onClose={() => setShowDate(false)}
        variant="danger">
        {errorMessageDate}
      </Alert>
      <Form className="block-example border border-primary rounded mb-0 form-padding" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} />
        </Form.Group>

        <>{admin === true &&
          <Form.Group className="mb-3"> <Form.Label>Author</Form.Label>
            <Form.Control type="text" required={true} value={author} onChange={event => setAuthor(event.target.value)} />
          </Form.Group>}
        </>

        <Form.Group className="mb-3">
          <Form.Label>Publication Date</Form.Label>
          <Form.Control type="date" value={publicationDate} onChange={event => setPublicationDate(event.target.value)} />
        </Form.Group>

        <div>


          <Form.Group className="some-buttons">
            <Button onClick={() => setActiveButton("button1")} className="mr-2" variant="primary">New header</Button>
            <Button onClick={() => setActiveButton("button2")} className="mr-2" variant="primary">New paragraph</Button>
            <Button onClick={() => setActiveButton("button3")} variant="primary">New image</Button>
          </Form.Group>

          <div style={{ marginTop: '30px' }}></div>

          {activeButton === 'button1' &&
            <div>
              <Form.Control type="text" required={true} value={content} onChange={event => { setContent(event.target.value); setNewBlockContent(event.target.value) }} />
              <div style={{ marginTop: '30px' }}></div>
              <Button onClick={() => handleAddHeader()}>Save header</Button>
            </div>}
          {activeButton === 'button2' &&
            <div>
              <Form.Control type="text" required={true} value={content} onChange={event => { setContent(event.target.value); setNewBlockContent(event.target.value) }} />
              <div style={{ marginTop: '30px' }}></div>
              <Button onClick={() => handleAddParagraph()}>Save paragraph</Button>
            </div>}
          {activeButton === 'button3' && <div><Form.Group className="mb-3">
            <div>
              <Col>
                <Row className="images-row">
                  <input className="radio-button" type="radio" value="image1" checked={selected === 'image1'} onClick={() => setSelected("image1")}></input>
                  <img className="image-button" src="../../images/image1.jpg"></img>
                  <input className="radio-button" type="radio" value="image2" checked={selected === 'image2'} onClick={() => setSelected("image2")}></input>
                  <img className="image-button" src="../../images/image2.jpg"></img>
                  <input className="radio-button" type="radio" value="image3" checked={selected === 'image3'} onClick={() => setSelected("image3")}></input>
                  <img className="image-button" src="../../images/image3.jpg"></img>
                  <input className="radio-button" type="radio" value="image4" checked={selected === 'image4'} onClick={() => setSelected("image4")}></input>
                  <img className="image-button" src="../../images/image4.jpg"></img>
                </Row>
              </Col>
            </div>
            <div style={{ marginTop: '30px' }}></div>
            <div>
              <Button onClick={() => { handleAddImage(selected) }} variant="primary">Save image</Button>
            </div>
          </Form.Group></div>}
        </div>
        <div style={{ marginTop: '30px' }}></div>
        <Form.Group className="mb-3">
          {blocks.map((block, index) => (
            <>
              <div style={{ marginTop: '30px' }}></div>
              <div key={index}>
                <Row>
                  <Col xl={1} md={1}>
                  <Row className="mt-2"> 
                      <Button className="red-link-block" onClick={() => handleCancelBlock(index)}>
                        <i className="bi bi-trash" />
                      </Button>
                    </Row>
                    <Row className="mt-2">
                      <Button className="square-button" onClick={() => BlockUp(index)}>
                        <i className="bi bi-arrow-up" />
                      </Button>
                    </Row>
                    <Row className="mt-2"> 
                      <Button className="square-button" onClick={() => BlockDown(index)}>
                        <i className="bi bi-arrow-down" />
                      </Button>
                    </Row>
                  </Col>
                  <Col md={9}>
                    {block.type !== "image" && <p><Form.Control type="text" required={true} value={block.content} onChange={event => { block.content = event.target.value; setContent(event.target.value); setNewBlockContent(event.target.value) }} />
                    </p>}
                    {block.type === "image" &&
                      <><ImageBlock key={block.id} block={block} handleAddImage={handleAddImage}></ImageBlock></>
                    }
                  </Col>
                </Row>
              </div>
            </>
          ))}

        </Form.Group>
        <div style={{ marginTop: '30px' }}></div>
        {!activeButton && (
          <>
            <Form.Group className="some-buttons">
              <Button className="mb-3" variant="primary" type="submit">Save Page</Button>
              <Link className="btn btn-danger mb-3" to={nextpage}> Cancel </Link>
            </Form.Group>
          </>
        )}
      </Form>
    </>
  )

}


// Block component
const ImageBlock = (props) => {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (props.block.content === "../../images/image1.jpg") {
      setSelectedOption("image1");
    }
    if (props.block.content === "../../images/image2.jpg") {
      setSelectedOption("image2");
    }
    if (props.block.content === "../../images/image3.jpg") {
      setSelectedOption("image3");
    }
    if (props.block.content === "../../images/image4.jpg") {
      setSelectedOption("image4");
    }
  }, [])

  return (
    <div>
      <Row>
        <Col>
          <label>
            <input
              className="radio-button"
              type="radio"
              value="image1"
              checked={selectedOption === "image1"}
              onChange={(event) => { setSelectedOption("image1"); props.block.content = "../../images/image1.jpg" }}
            />
            <img className="image-button" height="480px" width="auto" src="../../images/image1.jpg"></img>

          </label>
          <label>
            <input
              className="radio-button"
              type="radio"
              value="image2"
              checked={selectedOption === "image2"}
              onChange={() => { setSelectedOption("image2"); props.block.content = "../../images/image2.jpg" }}
            />
            <img className="image-button" height="480px" width="auto" src="../../images/image2.jpg"></img>
          </label>
        </Col>
        <div style={{ marginTop: '30px' }}></div>
        <Col>
          <label>
            <input
              className="radio-button"
              type="radio"
              value="image3"
              checked={selectedOption === "image3"}
              onChange={() => { setSelectedOption("image3"); props.block.content = "../../images/image3.jpg" }}
            />
            <img className="image-button" height="480px" width="auto" src="../../images/image3.jpg"></img>
          </label>
          <label>
            <input
              className="radio-button"
              type="radio"
              value="image4"
              checked={selectedOption === "image4"}
              onChange={() => { setSelectedOption("image4"); props.block.content = "../../images/image4.jpg" }}
            />
            <img className="image-button" height="480px" width="auto" src="../../images/image4.jpg"></img>
          </label>
        </Col>
      </Row>
    </div>
  );
};


export default PageForm;
