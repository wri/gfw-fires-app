import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalStore} from 'stores/ModalStore';
import {modalText} from 'js/config';
import React from 'react';

export default class Modal extends React.Component {

  constructor(props) {
    super(props);

    modalStore.listen(this.storeUpdated.bind(this));
    let defaultState = modalStore.getState();
    this.state = {
      layerInfo: defaultState.modalLayerInfo
    };
  }

  storeUpdated () {
    let currentState = modalStore.getState();
    this.setState({ layerInfo: currentState.modalLayerInfo });
  }

  render () {
    let layerInfo = this.state.layerInfo;
    return (
      <ModalWrapper>
        {!layerInfo.title ? <div className='no-info-available'>{modalText.noInfo}</div> :
          <div className='layer-modal-content'>
            <div className='source-header'>
              <strong className='source-title'>{layerInfo.title}</strong>
              <em className='source-description'>{layerInfo.subtitle}</em>
            </div>
            <div className='source-body'>
              <div className='source-table'>
                {layerInfo.table.map(this.tableMap)}
              </div>
              <div className='source-summary'>
                {layerInfo.overview.map(this.summaryMap)}
              </div>
              {!layerInfo.customContent ? null :
                layerInfo.customContent.map(this.htmlContentMap)
              }
              {!layerInfo.citation ? null :
                <div className='source-credits'>
                  {layerInfo.citation.map(this.paragraphMap)}
                </div>
              }
              {!layerInfo.moreContent ? null :
                layerInfo.moreContent.map(this.htmlContentMap)
              }
            </div>
          </div>
        }
      </ModalWrapper>
    );
  }

  tableMap (item) {
    return (
      <dl className='source-row'>
        <dt>{item.label}</dt>
        <dd dangerouslySetInnerHTML={{ __html: item.html }}></dd>
      </dl>
    );
  }

  summaryMap (item) {
    if (typeof item === 'string') {
      return <p dangerouslySetInnerHTML={{ __html: item }} />;
    } else {
      return (
        <ul>
          {item.map(listItem => <li dangerouslySetInnerHTML={{ __html: listItem }} />)}
        </ul>
      );
    }
  }

  paragraphMap (item) {
    return <p dangerouslySetInnerHTML={{ __html: item }} />;
  }

  htmlContentMap (item) {
    return <div dangerouslySetInnerHTML={{ __html: item }} />;
  }

}
