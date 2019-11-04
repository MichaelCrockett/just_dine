import React, { Component } from 'react';
import { ZomatoKey } from '../keys.js'
import RestaurantList from '../components/RestaurantList';
import ControlsContainer from '../containers/ControlsContainer.js'

  class RestaurantContainer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        restaurants: null,
        searchTerm: '',
        selectedRestaurant: null,
        cityDetails: null
      }

      this.handleSearchChange = this.handleSearchChange.bind(this)
    }

    handleSearchChange(value) {
      this.setState({searchTerm: value})
    }

    componentDidMount() {
      let lat;
      let lon;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          lat = position.coords.latitude;
          lon = position.coords.longitude;
          (this.apiCall(lat, lon))
        })
      }
    }

    apiCall(lat, lon) {
      const url = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`
      fetch(url, {
        headers: {
          'user-key': `${ZomatoKey}`
        }
      })
        .then(res => res.json())
        .then(data => this.setState({ restaurants: data }))
        .catch(err => console.error(err))
    }

    // apiCitySearch() {
    //   const url = `https://developers.zomato.com/api/v2.1/cities?q=${}`
    //   fetch(url, {
    //     headers: {
    //       'user-key': `${ZomatoKey}`
    //     }
    //   })
    //     .then(res => res.json())
    //     .then(data => this.setState({ cityDetails: data['location_suggestions'][0] }))
    //     .catch(err => console.error(err))
    // }

    // apiSearchCityId(id) {
    //   const url = `https://developers.zomato.com/api/v2.1/search?entity_id=${this.state.cityDetails}&entity_type=city`
    //   fetch(url, {
    //     headers: {
    //       'user-key': `${ZomatoKey}`
    //     }
    //   })
    //     .then(res => res.json())
    //     .then(data => this.setState({ restaurants: data }))
    //     .catch(err => console.error(err))
    // }

  render() {
    return (
        // <div className="restaurant-container">
          <ControlsContainer
          onSearchChange={this.handleSearchChange}
          searchTerm={this.state.searchTerm} />
        //   <RestaurantList
        //     restaurants={ this.state.restaurants } />
        // </div>
      );
  }
}

export default RestaurantContainer;
