const mainTableEl = document.getElementById('mainTable');
const mainTableCaption = mainTableEl.querySelector('caption');
const formFilterEl = document.getElementById('formFilter');
const loaderEl = document.getElementById('loader');
const dateStartEl = document.getElementById('dateStart');
const dateEndEl = document.getElementById('dateEnd');
const msgContainerEl = document.getElementById('msgContainer');
const msgEl = msgContainerEl.querySelector('.alert');
const headTotalEl = mainTableEl.querySelector('thead th.total');
const tableFootEl = mainTableEl.querySelector('tfoot');
const footTotalEl = tableFootEl.querySelector('tfoot td.total');

let tplHeadCountryCell = document.getElementById('headCountryCell').content;
let tplAppBlock = document.getElementById('appBlock').content;
let tplAppDetailsRow = document.getElementById('appDetailsRow').content;
let tplDefaultCountryCell = document.getElementById('defaultCountryCell').content;

formFilterEl.addEventListener('submit', function(e) {
  fetchData(dateStartEl.value, dateEndEl.value);

  e.preventDefault();
});

function initDates() {
  // initialize dates from a week ago to today
  let today = new Date();
  let aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);

  dateStartEl.value = aWeekAgo.toJSON().substring(0, 10);
  dateEndEl.value = today.toJSON().substring(0, 10);
}

function fetchData(start, end) {
  preFetchData();

  axios.get('/data', {
    params: {
      start: start,
      end: end,
    }
  })
    .then(function(response) {
      displayData(response.data.data);
      postFetchData();
    })
    .catch(function(error) {
      postFetchData();
      displayError(error);
    });
}

function preFetchData() {
  for (let el of formFilterEl) {
    el.disabled = true;
  }

  loaderEl.classList.remove('d-none');
  msgContainerEl.classList.add('d-none');
  mainTableEl.classList.add('loading');
}

function postFetchData() {
  for (let el of formFilterEl) {
    el.disabled = false;
  }

  loaderEl.classList.add('d-none');
  mainTableEl.classList.remove('loading');
}

function displayError(error) {
  let msg = 'An error has occurred, your data could not be loaded: ';

  if (error.response.data !== '' && typeof error.response.data === 'string') {
    msg += error.response.data;
  } else {
    msg += 'Unknown reason';
  }

  msg += ` (code: ${error.response.status})`;

  msgEl.innerHTML = msg;
  msgContainerEl.classList.remove('d-none');
  console.log(error);
}

function displayData(data) {
  clearTable();
  
  // todo: show dates as locale string
  mainTableCaption.innerHTML = `Showing data between ${data.start} and ${data.end}`;

  buildTHead(data.countries);
  buildTBody(data.apps, data.countries);
  buildTFoot(data._totals, data.countries);
  
  document.getElementById('placeholder').classList.add('d-none');
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

initDates();
