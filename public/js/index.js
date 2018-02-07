const mainTableEl = document.getElementById('mainTable');
const mainTableCaption = mainTableEl.querySelector('caption');
const formFilterEl = document.getElementById('formFilter');
const dateStartEl = document.getElementById('dateStart');
const dateEndEl = document.getElementById('dateEnd');
const headTotalEl = mainTableEl.querySelector('thead th.total');
const tableFootEl = mainTableEl.querySelector('tfoot');
const footTotalEl = tableFootEl.querySelector('tfoot td.total');

let tplHeadCountryCell = document.getElementById('headCountryCell').content;
let tplAppBlock = document.getElementById('appBlock').content;
let tplAppDetailsRow = document.getElementById('appDetailsRow').content;
let tplDefaultCountryCell = document.getElementById('defaultCountryCell').content;

dateStartEl.value = '2017-08-01'; //now - 7 days
dateEndEl.value = '2017-08-02'; // tomorrow (date is excluded)

formFilterEl.addEventListener('submit', function(e) {
  axios.get('/data', {
    params: {
      start: dateStartEl.value,
      end: dateEndEl.value,
    }
  })
    .then(function(response) {
      console.log(response);
      displayData(response.data.data);
    })
    .catch(function(error) {
      console.error(error);
    });
  e.preventDefault();
});

function displayData(data) {
  clearTable();
  
  mainTableCaption.innerHTML = `Showing data between ${dateStartEl.value} and ${dateEndEl.value}`;

  buildTHead(data.countries);
  buildTBody(data.apps, data.countries);
  buildTFoot(data._totals, data.countries);
  
  mainTableEl.classList.remove('d-none');
}

function clearTable() {
  mainTableEl.classList.add('d-none');

  for (let el of mainTableEl.querySelectorAll('.tpl')) {
    el.remove();
  }

  mainTableCaption.innerHTML = '';
  footTotalEl.innerHTML = 0;
}

function buildTHead(countries) {
  countries.forEach((country) => {
    let cell = document.importNode(tplHeadCountryCell, true);
    cell.querySelector('th').innerHTML = country;
    headTotalEl.parentNode.insertBefore(cell, headTotalEl);
  });
}

function buildTBody(apps, countries) {
  for (let appName in apps) {
    if (apps.hasOwnProperty(appName)) {
      let app = apps[appName];

      let blockEl = document.importNode(tplAppBlock, true);
      let blockTotalEl = blockEl.querySelector('.total');
      let blockDetailsEl = blockEl.querySelector('tbody.details');

      blockEl.querySelector('th').innerHTML = appName;
      
      countries.forEach((country) => {
        let cell = document.importNode(tplDefaultCountryCell, true);
        cell.querySelector('td').innerHTML = (app._totals[country] === undefined) ? '&nbsp;' : app._totals[country].toFixed(2);
        blockTotalEl.parentNode.insertBefore(cell, blockTotalEl);
      });

      blockTotalEl.innerHTML = app._totals._total.toFixed(2);
      
      buildAppDetails(blockDetailsEl, app, countries);

      tableFootEl.parentNode.insertBefore(blockEl, tableFootEl);
    }
  }
}

function buildAppDetails(parentEl, app, countries) {
  for (let platformName in app) {
    if (app.hasOwnProperty(platformName) && platformName !== '_totals') {
      let platform = app[platformName];

      buildAppDetailsPlatform(platform, platformName, parentEl, countries);
      buildAppDetailsPlatformAcquisition(platform.acquisition, parentEl, countries);
      buildAppDetailsPlatformMonetization(platform.monetization, parentEl, countries);
    }
  }
}

function buildAppDetailsPlatform(platform, platformName, parentEl, countries) {
  let rowEl = document.importNode(tplAppDetailsRow, true);
  let totalEl = rowEl.querySelector('.total');

  rowEl.querySelector('tr').classList.add('platform');
  rowEl.querySelector('th').innerHTML = platformName;
  
  countries.forEach((country) => {
    let cell = document.importNode(tplDefaultCountryCell, true);
    cell.querySelector('td').innerHTML = (platform._totals[country] === undefined) ? '&nbsp;' : platform._totals[country].toFixed(2);
    totalEl.parentNode.insertBefore(cell, totalEl);
  });

  totalEl.innerHTML = platform._totals._total.toFixed(2);
  
  parentEl.appendChild(rowEl);
}

function buildAppDetailsPlatformAcquisition(data, parentEl, countries) {
  let rowEl = document.importNode(tplAppDetailsRow, true);
  let totalEl = rowEl.querySelector('.total');

  rowEl.querySelector('tr').classList.add('acquisition');
  rowEl.querySelector('th').innerHTML = 'Expenditure';
  
  countries.forEach((country) => {
    let cell = document.importNode(tplDefaultCountryCell, true);
    cell.querySelector('td').innerHTML = (data[country] === undefined) ? '&nbsp;' : data[country].toFixed(2);
    totalEl.parentNode.insertBefore(cell, totalEl);
  });

  totalEl.innerHTML = data._total.toFixed(2);
  
  parentEl.appendChild(rowEl);
}

function buildAppDetailsPlatformMonetization(data, parentEl, countries) {
  let rowEl = document.importNode(tplAppDetailsRow, true);
  let totalEl = rowEl.querySelector('.total');

  rowEl.querySelector('tr').classList.add('monetization');
  rowEl.querySelector('th').innerHTML = 'Revenue';
  
  countries.forEach((country) => {
    let cell = document.importNode(tplDefaultCountryCell, true);
    cell.querySelector('td').innerHTML = (data[country] === undefined) ? '&nbsp;' : data[country].toFixed(2);
    totalEl.parentNode.insertBefore(cell, totalEl);
  });

  totalEl.innerHTML = data._total.toFixed(2);
  
  parentEl.appendChild(rowEl);
}

function buildTFoot(totals, countries) {
  countries.forEach((country) => {
    let cell = document.importNode(tplDefaultCountryCell, true);
    cell.querySelector('td').innerHTML = totals[country].toFixed(2);
    footTotalEl.parentNode.insertBefore(cell, footTotalEl);
  });

  footTotalEl.innerHTML = totals._total.toFixed(2);
}