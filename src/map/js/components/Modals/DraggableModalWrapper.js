import React, { PropTypes } from 'react';

let closeSvg = '<use xlink:href="#shape-close" />';

 /**
* Should be wrapped in a component with relative or absolute position
*/
export default function DraggableModalWrapper (props) {
  // const contentClass = `${props.theme ? props.theme : ''}`;
  return (
    <article id='draggableModal' className='modal draggable' style={{ position: 'absolute', top: '75px', zIndex: '1000', left: '375px', backgroundColor: 'white' }}> {/* draggable='true' onDragEnd={props.onDragEnd} */}
      <div title='close' className='close-icon pointer' onClick={props.onClose} >
        <svg dangerouslySetInnerHTML={{ __html: closeSvg }}/>
      </div>
      {/* <div className={contentClass}> */}
      <div>
        {props.children}
      </div>
    </article>
  );
}

//  DraggableModalWrapper.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   theme: PropTypes.string
// };
