const axios = require('axios');
const config = require('config');

/**
 * 
 * @param {string} start yyyy-mm-dd
 * @param {string} end yyyy-mm-dd
 * @returns {object} A request supported by axios
 */
function getRequest(start, end) {
  return axios.get(config.get('acquisitionApi.url'), {
    params: {
      api_key: config.get('acquisitionApi.key'),
      start,
      end,
      format: 'json',
      columns: 'cost,country,platform,application', // day,impressions,clicks,ctr,cost,country,ad_type,platform,application,package_name
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

    // not using package_name as it isn't available in the monitezation api
    if (apps[dataSet.application] === undefined) {
      apps[dataSet.application] = {
        _totals: {
          _total: 0,
        },
      };
    }

    if (apps[dataSet.application]._totals[dataSet.country] === undefined) {
      apps[dataSet.application]._totals[dataSet.country] = 0;
    }
    
    if (apps[dataSet.application][dataSet.platform] === undefined) {
      apps[dataSet.application][dataSet.platform] = {
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

    if (apps[dataSet.application][dataSet.platform]._totals[dataSet.country] === undefined) {
      apps[dataSet.application][dataSet.platform]._totals[dataSet.country] = 0;
    }
    
    if (apps[dataSet.application][dataSet.platform].acquisition[dataSet.country] === undefined) {
      apps[dataSet.application][dataSet.platform].acquisition[dataSet.country] = 0;
    }
    
    apps[dataSet.application][dataSet.platform].acquisition[dataSet.country] -= dataSet.cost;
    apps[dataSet.application][dataSet.platform].acquisition._total -= dataSet.cost;
    apps[dataSet.application][dataSet.platform]._totals[dataSet.country] -= dataSet.cost;
    apps[dataSet.application][dataSet.platform]._totals._total -= dataSet.cost;
    apps[dataSet.application]._totals[dataSet.country] -= dataSet.cost;
    apps[dataSet.application]._totals._total -= dataSet.cost;

    globalData._totals[dataSet.country] -= dataSet.cost;
    globalData._totals._total -= dataSet.cost;

    countries.add(dataSet.country);
  }

  return globalData;
}

module.exports = {
  getRequest,
  computeData
};
