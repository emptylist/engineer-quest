// Engineer Quest Incremental Game
// (c) 2015 James Crooks

// Global Data and Display Handling
var ticksPerSecond = 40;
var tickSpeed = 25;

var resources = {
  funds: 100,
  fame: 0,
};

var skills = {
  computer: 0,
  webDesign: 0,
  programming: 0,
  mathematics: 0,
  electricalEngineering: 0,
  computerEngineering: 0,
  mechanicalEngineering: 0,
  robotics: 0,
  finance: 0,
  philosophy: 0,
  art: 0,
};

function updateDisplay () {
  var fundsDisplay = document.getElementById("funds-counter");
  var fameDisplay = document.getElementById("fame-counter");

  fundsDisplay.innerHTML = "Funds $" + resources.funds.toString();
  fameDisplay.innerHTML = "Fame " + resources.fame.toString();
}

// Tick Handler

var tickers = [];

function globalTick() {
  for (var i = 0; i < tickers.length; i++) {
    if (tickers[i].active) {
      tickers[i].tick();
    }
  }
  updateDisplay();
}

var globalTicker = setInterval(globalTick, tickSpeed);

// Buildings

var ActionFactory = function (actiondata, tickHandler) {
  var action = Object.create(null);
  tickHandler.push(action);
  for (var prop in actiondata) {
    if (actiondata.hasOwnProperty(prop)) {
      action[prop] = actiondata[prop];
    }
  }

  action.buy = actiondata.buy || function (n) {
    n = n || 1;
    var totalPrice = action.scale != 1 ? 
      action.price * (1 - Math.pow(action.scale, n)) / (1 - action.scale) :
      n * action.price;
    if (resources.funds > totalPrice) {
      action.active = true;
      resources.funds -= totalPrice;
      resources.fame += action.fame;
      action.price = Math.round(action.price * Math.pow(action.scale, n));
      action.count += n;
      updateDisplay();
    }
  };

  action.activate = actiondata.activate || function () {
    action.active = true;
    action.element.classList.add("glow");
    action.element.classList.add("action-active");
  };

  action.tick = actiondata.tick || function () {
    action.currentTick++;
    if (action.currentTick >= action.completionTime) {
      action.complete();
    }
  };

  action.complete = actiondata.complete || function () {
    action.currentTick = 0;
    action.active = false;
    action.element.classList.remove("glow");
    action.element.classList.remove("action-active");
    action.payout();
  };

  action.payout = actiondata.payout || function () {
    resources.funds += action.count * action.value;
  };

  if (action.element) {
    action.element.addEventListener("focus", function () {
      action.element.blur();
    });

    action.element.addEventListener("click", function () {
      action.activate();
    });

    if (actiondata.active) {
      action.element.classList.add("glow");
      action.element.classList.add("action-active");
    }

    action.onfocus = actiondata.onfocus || function () {
      action.element.blur();
    };
  }
  
  return action;

};

//Work Actions

var job = {
  description: "Burger Baron Grunt",
  pay: 2,
  clout: 0,
  jobTitleElement: document.getElementById("job-title"),
  jobPayElement: document.getElementById("job-pay"),
  promotion: {
    cloutRequired: 10000,
    description: "Burger Baron Window Manager",
    pay: 3,
  },
  update: function () {
    job.jobTitleElement.innerHTML = "Current Job: " + job.description;
    job.jobPayElement.innerHTML = "Pay: " + job.pay.toString() + "/s";
  },
};

var work = ActionFactory({
    price: 0,
    value: job.pay,
    scale: 1,
    count: 1,
    fame: 0,
    completionTime: 40,
    active: true,
    element: document.getElementById("work"),
    currentTick: 0,

    payout: function () {
      resources.funds += work.value;
      job.clout++;
      if (job.clout > job.promotion.cloutRequired) {
        work.promote();
      }
      work.activate();
    },

    promote: function () {
      job.description = job.promotion.description || job.description;
      job.pay = job.promotion.pay || job.pay;
      job.clout = 0;
      job.update();
    },
    
}, tickers);

var eCommerceSite = ActionFactory({
    price: 10,
    value: 1,
    scale: 1.1,
    count: 0,
    fame: 0,
    completionTime: 250,
    active: false,
    element: document.getElementById("ecommerce-site"),
    currentTick: 0,
}, tickers);

// Upgrade Actions

var tinker = ActionFactory({
    price: 0,
    value: 0,
    scale: 1,
    count: 0,
    fame: 0,
    completionTime: 1000,
    active: false,
    element: document.getElementById("tinker"),
    currentTick: 0,

    payout: function () {
      skills.computer += 1;
      tinker.deactivate();
    },

    activate: function () {
      tinker.element.classList.add("glow");
      tinker.element.classList.add("action-active");
      tinker.active = true;
    },

    deactivate: function () {
      tinker.element.classList.remove("glow");
      tinker.element.classList.remove("action-active");
      tinker.active = false;
    },

}, tickers);

// Bills

var rentTicker = new (function (resources, tickHandler) {
  tickHandler.push(this);
  var currentTick = 0;
  var timeToFinish = 60;
  var currentTime = 60;
  this.bill = 100;
  this.active = true;
  element = document.getElementById("bills-display");

  this.tick = function () {
    currentTick++;
    if (currentTick >= ticksPerSecond) {
      currentTick = 0;
      currentTime--;
      this.updateTime();
    }
    if (currentTime <= 0) {
      this.cost();
      currentTime = timeToFinish;
    }
  };

  this.updateTime = function () {
    var minutes = Math.floor(currentTime / 60);
    var seconds = currentTime % 60;
    var timeString = (minutes < 10 ? "0" : "") + 
      minutes.toString() + 
      ":" +
      seconds.toString();
    element.innerHTML = "Rent: $" + this.bill.toString() + " &emsp;&emsp; " + timeString;
  };

  this.cost = function () {
    resources.funds -= this.bill;
  };

})(resources, tickers);


