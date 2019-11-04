import React from 'react';
import Search from '../components/Search.js';

const ControlsContainer = (props) => {

  return (
    <Search
    onSearchChange={props.onSearchChange}
    searchTerm={props.searchTerm}/>
  )
}

export default ControlsContainer;