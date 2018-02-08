const axios = require('axios');
const config = require('config');

function getAcquisitionRequest(start, end) {
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

function getMonetizationRequest(start, end) {
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

function computeAcquisitionData(inputData, globalData) {
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

function computeMonetizationData(inputData, globalData) {
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

function validateData(params) {
  if (params.start === undefined || params.end === undefined) {
    throw new Error('Both start and end dates are required');
  }

  const start = new Date(params.start);
  const end = new Date(params.end);
  let today = new Date();
  // resetting the time to ease comparisons
  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);

  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  if (start > today) {
    throw new Error('Start date must be today at the latest');
  }

  if (end > tomorrow) {
    throw new Error('End date must be tomorrow at the latest');
  }
}

module.exports = function(params, res) {
  const start = params.start;
  const end = params.end;
  let data = {
    countries: [],
    countriesSet: new Set(),
    apps: {},
    _totals: {
      _total: 0,
    },
  };
  // todo: validate params (start < end, start and end < today...)

  try {
    validateData(params);
  } catch (error) {
    res.status(400).send(error.message);
    // todo: use express' error handling, with return next(error)
    return;
  }
  
  axios.all([getAcquisitionRequest(start, end), getMonetizationRequest(start, end)])
    .then(axios.spread(function (acquisitionResponse, monetizationResponse) {
      // console.log(acquisitionResponse, monetizationResponse);
      computeAcquisitionData(acquisitionResponse.data.data, data);
      computeMonetizationData(monetizationResponse.data.data, data);

      data.countries = Array.from(data.countriesSet);
      data.countries.sort();

      const json = {
        start,
        end,
        data,
      };

      res.status(200).send(json);
    }))
    .catch(function (error) {
      let msg = 'Internal Server Error';

      if (process.env.NODE_ENV !== 'production') {
        msg = error.message;
        console.log(error);
      }

      res.status(500).send(msg);
    });
};
