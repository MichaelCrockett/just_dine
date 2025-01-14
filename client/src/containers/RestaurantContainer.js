import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route, Link, useParams } from 'react-router-dom';
import { ZomatoKey } from '../keys.js';
import RestaurantList from '../components/RestaurantList';
import FilteredRestaurantList from '../components/FilteredRestaurantsList.js';
import ControlsContainer from '../containers/ControlsContainer.js';
import RestaurantDetail from '../components/RestaurantDetail';
import AppHeader from '../components/AppHeader';
import FavouritesList from '../components/FavouritesList';
import Favourites from '../models/favourites.js'
import './RestaurantContainer.css'


class RestaurantContainer extends Component {

    constructor(props) {
      super(props);
      this.state = {
        restaurants: [],
        filteredRestaurants: [],
        showFilteredRestaurants: false,
        searchTerm: '',
        nameFilter: '',
        selectedRestaurant: null,
        favRestaurants: [],
        favListChecked: false,
        selectedFavourite: null,
        loading: false,
        filterType: null,
        loading: false,
        favourite: false
      }
      this.handleSearchChange = this.handleSearchChange.bind(this);
      this.handleSelect = this.handleSelect.bind(this);
      this.apiCitySearch = this.apiCitySearch.bind(this);
      this.apiSearchCityId = this.apiSearchCityId.bind(this);
      this.handleAddFav = this.handleAddFav.bind(this);
      this.cuisineTypes = this.cuisineTypes.bind(this);
      this.handleCuisineSelect = this.handleCuisineSelect.bind(this);
      this.handleDeleteFav = this.handleDeleteFav.bind(this);
      this.handleFavListSelect = this.handleFavListSelect.bind(this);
      this.handleNameFilter = this.handleNameFilter.bind(this);
      this.handleFilterTypeChange = this.handleFilterTypeChange.bind(this);
      this.handleCheckbox = this.handleCheckbox.bind(this);
    }

  componentDidMount() {
    this.setState({loading: true})
    let lat;
    let lon;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        (this.apiCall(lat, lon))
      })
    }

    Favourites.get()
    .then(favRestaurants => this.setState({ favRestaurants }));
  }

  handleSearchChange(value) {
    this.setState({ searchTerm: value })
  }

  handleSelect(id) {
    const restaurant = this.state.restaurants.find((restaurant) => {
      return restaurant.restaurant.id === id
    })
    this.setState({ selectedRestaurant: restaurant })

    if (this.state.favRestaurants.filter(favrestaurant =>
      favrestaurant.restaurant.id === restaurant.restaurant.id).length) {
    this.setState({ favourite: true })
    }
  };

  apiCall(lat, lon) {
    const url = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`
    this.setState({loading: true})
    fetch(url, {
      headers: {
        'user-key': `${ZomatoKey}`
      }
    })
    .then(res => res.json())
    .then(data => this.setState({ restaurants: data.restaurants, loading: false }))
    .catch(err => console.error(err))
  }

  apiCitySearch() {
    const searchTerm = this.state.searchTerm
    const url = `https://developers.zomato.com/api/v2.1/cities?q=${searchTerm}`
    fetch(url, {
      headers: {
        'user-key': `${ZomatoKey}`
      }
    })
    .then(res => res.json())
    .then(data => this.apiSearchCityId(data['location_suggestions'][0].id))
    .catch(err => console.error(err));

    this.setState({ favListChecked: false })
  }

  handleFavListSelect(){
    this.setState({ favListChecked: true })
    this.setState({ selectedRestaurant: null })
  }

  handleCheckbox(restaurant) {
    if (!this.state.favourite) {
      this.setState({ favourite: true})
      this.handleAddFav(restaurant)
    } else {
      this.setState({ favourite: false })
      this.handleDeleteFav(restaurant)
    }
  }

  handleAddFav(newFaveRestaurant) {
    if (!this.state.favRestaurants.filter(restaurant =>
      restaurant.restaurant.id === newFaveRestaurant.restaurant.id).length) {
        Favourites.post(newFaveRestaurant)
        .then(addRestaurant => this.setState({
          favRestaurants: [...this.state.favRestaurants, addRestaurant]
        }))
      }
    }

  handleDeleteFav(restaurant) {
      const restaurantFromFaves = this.state.favRestaurants.find(currentRestaurant => {
        return restaurant.restaurant.id === currentRestaurant.restaurant.id;
      })
      const restaurantId = restaurantFromFaves._id;
      Favourites.delete(restaurantId)
      .then(favRestaurants => this.setState({ favRestaurants }))
  }

  apiSearchCityId(id) {
    const url = `https://developers.zomato.com/api/v2.1/search?entity_id=${id}&entity_type=city`
    fetch(url, {
      headers: {
        'user-key': `${ZomatoKey}`
      }
    })
    .then(res => res.json())
    .then(data => this.setState({ restaurants: data.restaurants }))
    .catch(err => console.error(err))

    this.setState({ favListChecked: false })
  }

  handleCuisineSelect(cuisine) {
    if (cuisine === 'Show all') {
      this.setState({ showFilteredRestaurants: false });
      return;
    }
    const filteredRestaurants = this.state.restaurants.filter((restaurant) => {
      return restaurant.restaurant.cuisines === cuisine;
    });
    this.setState({ filteredRestaurants: filteredRestaurants, showFilteredRestaurants: true,
       selectedRestaurant: null })
    this.setState({ favListChecked: false })
  }

  cuisineTypes() {
    const cuisineTypes = new Set(this.state.restaurants.map((restaurant) => {
      return restaurant.restaurant.cuisines
    }))
    return cuisineTypes;
  }

  handleNameFilter(searchTerm) {
    this.setState({ nameFilter: searchTerm });
    const filteredRestaurants = this.state.restaurants.filter((restaurant) => {
      const name = restaurant.restaurant.name.toLowerCase();
      const nameToFind = searchTerm.toLowerCase()
      return name.includes(searchTerm);
    })
    this.setState({ filteredRestaurants: filteredRestaurants, showFilteredRestaurants: true,
       selectedRestaurant: null })
  }

  handleFilterTypeChange(type) {
    this.setState({ filterType: type });
  }

  render() {
    if (this.state.loading) {
      return (
        <h1 className="loading-message">Loading Restaurants...</h1>
      )
    }
    return (
        <div className="restaurant-container" id="main-container">
          <AppHeader
            onSearchChange={ this.handleSearchChange }
            onSearchSubmit={ this.apiCitySearch }
            searchTerm={ this.state.searchTerm }
            cuisineTypes={ this.cuisineTypes() }
            onCuisineSelect={ this.handleCuisineSelect }
            nameFilter={ this.nameFilter }
            onNameFilterInput={ this.handleNameFilter }
            onFilterTypeSelect={ this.handleFilterTypeChange }
            filterType={ this.state.filterType }
            onSelectFavList={ this.handleFavListSelect }/>

          <RestaurantDetail
            selectedRestaurant={ this.state.selectedRestaurant }
            selectedFavourite={ this.state.selectedFavourite }
            markFav={ this.handleAddFav }
            deleteFav={ this.handleDeleteFav }
            favourite={ this.state.favourite }
            checkboxFav={ this.handleCheckbox }/>

          <RestaurantList
            restaurants={ this.state.restaurants }
            onSelect={this.handleSelect}
            favListChecked={ this.state.favListChecked }
            selectedRestaurant={ this.state.selectedRestaurant }
            showFilteredRestaurants={ this.state.showFilteredRestaurants }/>

          <FilteredRestaurantList
            restaurants={ this.state.filteredRestaurants }
            onSelect={this.handleSelect}
            favListChecked={ this.state.favListChecked }
            selectedRestaurant={ this.state.selectedRestaurant }
            showFilteredRestaurants={ this.state.showFilteredRestaurants }/>

          <FavouritesList
            restaurants= {  this.state.restaurants }
            favListChecked={ this.state.favListChecked }
            favRestaurants={ this.state.favRestaurants }
            onSelect={this.handleSelect}
            selectedFavourite={ this.state.selectedFavourite }
            selectedRestaurant={ this.state.selectedRestaurant }/>
      </div>
    )
  }
}

export default RestaurantContainer;
