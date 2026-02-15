import React from 'react';

const Image = (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || ''} />;
};

export default Image;
