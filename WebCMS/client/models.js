'use strict';

import dayjs from 'dayjs';

export function Page(id, title, author, creationDate, publicationDate, contentBlocks = []) {
  this.id = id;
  this.title = title;
  this.author = author;
  this.creationDate = dayjs(creationDate);
  this.publicationDate = dayjs(publicationDate);
  this.contentBlocks = contentBlocks.map(block => new contentBlock(block.type, block.content));
}

export function contentBlock(type, content) {
    this.type = type;   // header, paragraph, image
    this.content = content;
} 

