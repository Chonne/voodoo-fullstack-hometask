const axios = require('axios');
const config = require('config');
const acquisition = require('./acquisition');
const monetization = require('./monetization');

/**
 * Checks the parameters sent to the server
 * todo: check if the format is as expected: yyyy-mm-dd
 * @param {object} params Keys are "start" and "end", both strings
 */
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

/**
 * todo: remove the dependency on Express' res variable
 * @param {object} params Keys are "start" and "end", both strings
 * @param {object} res Variable used by Express
 */
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

  try {
    validateData(params);
  } catch (error) {
    res.status(400).send(error.message);
    return;
  }
  
  axios.all([
    acquisition.getRequest(start, end),
    monetization.getRequest(start, end)
  ])
    .then(axios.spread(function (acquisitionResponse, monetizationResponse) {
      // console.log(acquisitionResponse, monetizationResponse);
      acquisition.computeData(acquisitionResponse.data.data, data);
      monetization.computeData(monetizationResponse.data.data, data);

      data.countries = Array.from(data.countriesSet);
      data.countries.sort();

      const response = {
        start,
        end,
        data,
      };

      res.status(200).send(response);
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
