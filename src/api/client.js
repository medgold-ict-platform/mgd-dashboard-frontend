/***********************************************************
 * PUBLIC API
**********************************************************/
import * as common from './common';

const DEBUG = true

export default class client {
  static useAPI() {
    common.setURL("https://o7wm1bidx3.execute-api.eu-west-1.amazonaws.com/dev/")
  }

  /********************
    DATASETS
  ********************/
  static ids() {
    this.useAPI();
    return common.api(`ids`, 'GET', {});
  }

  static info(selected) {
    if(DEBUG) console.log('API info selected:', selected)

    this.useAPI();
    return common.api(`${selected}/info`, 'GET', {});
  }

  static timeline(selected, type){
    if(DEBUG) console.log('API timeline selected:', selected)
    if(DEBUG) console.log('API timeline type:', type)

    this.useAPI();
    return common.api(`${selected}/${type}/timeline`, 'GET', {})
  }

  static MatchAll(params){
    if(DEBUG) console.log('API MatchAll params:', params)

    this.useAPI();
    return common.api(`index/match-all`, 'GET', params)
  }

  static MatchLocation(params){
    if(DEBUG) console.log('API MatchLocation params:', params)

    this.useAPI();
    return common.api(`index/match-location`, 'GET', params)
  }

  static MatchLocationSeasonal(params){
    if(DEBUG) console.log('API MatchLocationSeasonal params:', params)

    this.useAPI();
    return common.api(`index/match-location/seasonal_forecast`, 'GET', params)
  }

  static getlink(params){
    if(DEBUG) console.log('API getlink params:', params)

    this.useAPI();
    return common.api(`getlink`, 'GET', params)
  }

}