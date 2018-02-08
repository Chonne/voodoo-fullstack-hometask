const axios = require('axios');
const config = require('config');

/**
 * 
 * @param {string} start yyyy-mm-dd
 * @param {string} end yyyy-mm-dd
 * @returns {object} A request supported by axios
 */
function getRequest(start, end) {
  return axios.get(config.get('monetizationApi.url'), {
    params: {
      start,
      end,
      dimensions: 'country,os,game', // date,country,format,os,game,placement
      aggregates: 'revenue', // views,conversions,revenue
    },
    headers: {
      'Authorization': 'Bearer ' + config.get('monetizationApi.key'),
    }
  });
}

function computeData(inputData, globalData) {
  let apps = globalData.apps;
  let countries = globalData.countriesSet;
  
  for (let dataSet of inputData) {
    if (globalData._totals[dataSet.country] === undefined) {
      globalData._totals[dataSet.country] = 0;
    }

    if (apps[dataSet.game] === undefined) {
      apps[dataSet.game] = {
        _totals: {
          _total: 0,
        },
      };
    }

    if (apps[dataSet.game]._totals[dataSet.country] === undefined) {
      apps[dataSet.game]._totals[dataSet.country] = 0;
    }
    
    if (apps[dataSet.game][dataSet.os] === undefined) {
      apps[dataSet.game][dataSet.os] = {
        acquisition: {
          _total: 0,
        },
        monetization: {
          _total: 0,
        },
        _totals: {
          _total: 0,
        },
      };
    }

    if (apps[dataSet.game][dataSet.os]._totals[dataSet.country] === undefined) {
      apps[dataSet.game][dataSet.os]._totals[dataSet.country] = 0;
    }
    
    if (apps[dataSet.game][dataSet.os].monetization[dataSet.country] === undefined) {
      apps[dataSet.game][dataSet.os].monetization[dataSet.country] = 0;
    }
    
    apps[dataSet.game][dataSet.os].monetization[dataSet.country] += dataSet.revenue;
    apps[dataSet.game][dataSet.os].monetization._total += dataSet.revenue;
    apps[dataSet.game][dataSet.os]._totals[dataSet.country] += dataSet.revenue;
    apps[dataSet.game][dataSet.os]._totals._total += dataSet.revenue;
    apps[dataSet.game]._totals[dataSet.country] += dataSet.revenue;
    apps[dataSet.game]._totals._total += dataSet.revenue;

    globalData._totals[dataSet.country] += dataSet.revenue;
    globalData._totals._total += dataSet.revenue;

    countries.add(dataSet.country);
  }

  return globalData;
}

module.exports = {
  getRequest,
  computeData
};
