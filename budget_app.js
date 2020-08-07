//////            Budget App      /////

// Budget Controller
var budget_controller = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calc_percentages = function(total_income) {

    if (total_income > 0) {
      this.percentage = Math.round((this.value / total_income) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.get_percent = function() {
    return this.percentage;
  };

  var Income  = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calc_total = function(type) {
    var sum = 0;
    data.all_items[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    all_items: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    add_item: function(type, des, val) {
      var new_item, ID;

      // Create new ID
      if (data.all_items[type].length > 0) {
        ID = data.all_items[type][data.all_items[type].length - 1].id + 1;
      } else {
        ID = 0;
      };


      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        new_item = new Expense(ID, des, val);
      } else if (type === 'inc') {
        new_item = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.all_items[type].push(new_item);

      // Return the new element
      return new_item;
    },

    delete_item: function(type, id) {
      var ids, index;

      ids = data.all_items[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.all_items[type].splice(index, 1);
      }
    },

    calc_budget: function() {

      // Calc total income and expenses
      calc_total('exp');
      calc_total('inc');

      // Calc budget: income - expense
      data.budget = data.totals.inc - data.totals.exp;

      // calc percentage of income
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calc_percentages: function() {

      data.all_items.exp.forEach(function(cur) {
        cur.calc_percentages(data.totals.inc);
      });
    },

    get_percentages: function() {
      var all_perc = data.all_items.exp.map(function(cur) {
        return cur.get_percent();
      });
        return all_perc;
    },

    get_budget: function() {
      return {
        budget: data.budget,
        total_inc: data.totals.inc,
        total_exp: data.totals.exp,
        percentage: data.percentage
      }

    },

    testing: function() {
      console.log(data);
    }
  };

})();


// UI Controller
var ui_controller = (function() {
  var DOMstrings = {
    input_type: '.add__type',
    input_des: '.add__description',
    input_value: '.add__value',
    input_button: '.add__btn',
    income_container: '.income__list',
    expenses_container: '.expenses__list',
    budget_label: '.budget__value',
    income_label: '.budget__income--value',
    expenses_label: '.budget__expenses--value',
    percentage_label: '.budget__expenses--percentage',
    container: '.container',
    expenses_percent_label: '.item__percentage',
    date_label: '.budget__title--month'
  };
  var format_number = function(num, type) {
    var num_split, int, dec, type;
    /*
    + or - before number
    exactly 2 decimal places
    comma seperating the thousands
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    num_split = num.split('.');

    int = num_split[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

    }
    dec = num_split[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var node_list_for_each = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    get_input: function() {
      return {
        type : document.querySelector(DOMstrings.input_type).value, // Can be Income or Expense
        description : document.querySelector(DOMstrings.input_des).value,
        value : parseFloat(document.querySelector(DOMstrings.input_value).value)
      };
    },

    add_list_item: function(obj, type) {
      var html, new_html, element, fields, fields_arr;
      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.income_container;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp'){
        element = DOMstrings.expenses_container;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace placeholder text with some actual data
      new_html = html.replace('%id%', obj.id);
      new_html = new_html.replace('%description%', obj.description);
      new_html = new_html.replace('%value%', format_number(obj.value, type));

      // Insert the HTML to the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', new_html);
    },

    delete_list_item: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el)
    },

    clear_fields: function() {
      fields = document.querySelectorAll(DOMstrings.input_des + ', ' + DOMstrings.input_value);

      fields_arr = Array.prototype.slice.call(fields)

      fields_arr.forEach(function(current, index, array) {
        current.value = "";
      });

      fields_arr[0].focus();

    },

    display_budget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budget_label).textContent = format_number(obj.budget, type);
      document.querySelector(DOMstrings.income_label).textContent = format_number(obj.total_inc, 'inc');
      document.querySelector(DOMstrings.expenses_label).textContent = format_number(obj.total_exp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentage_label).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentage_label).textContent = '---';
      }
    },

    display_percentages: function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expenses_percent_label);


      node_list_for_each(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---'
        }
      });
    },

    display_month: function() {
      var now, year, month, months;
      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.date_label).textContent = months[month] + ' ' + year;

    },

    change_type: function() {

      var fields = document.querySelectorAll(
        DOMstrings.input_type + ',' +
        DOMstrings.input_des + ',' +
        DOMstrings.input_value);

      node_list_for_each(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.input_button).classList.toggle('red');
    },

    get_DOM_strings: function() {
      return DOMstrings;
    }
  };

})();

// Global App Controller
var controller = (function(budgetCtrl, uiCtrl) {
  var DOM = uiCtrl.get_DOM_strings();

  var setup_event_listeners = function() {
    document.querySelector(DOM.input_button).addEventListener('click', ctrl_add_item);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrl_add_item();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrl_delete_item)

    document.querySelector(DOM.input_type).addEventListener('change', uiCtrl.change_type)
  };

  var update_budget = function() {
    // 1. Calculate budget
    budgetCtrl.calc_budget();
    // 2. Return the budget
    var budget = budgetCtrl.get_budget();
    // 3. Display the budget on the UI
    uiCtrl.display_budget(budget);
  };

  var update_percentages = function() {

    // 1. Calc update_percentages
    budgetCtrl.calc_percentages();
    // 2. Read percent from budget controller
    var percentages = budgetCtrl.get_percentages();
    // 3. Update UI with the new percentage
    uiCtrl.display_percentages(percentages);
  };

  var ctrl_add_item = function() {
    var input, new_item;
    // 1. Get the field input data
    input = uiCtrl.get_input();

    if (input.description != "" && input.value && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      new_item = budgetCtrl.add_item(input.type, input.description, input.value);

      // 3. Add the item to UI
      uiCtrl.add_list_item(new_item, input.type);

      // 4. Clear the fields
      uiCtrl.clear_fields();

      // 5. Calc and update budget
      update_budget();

      // 6. Calc and update percentages
      update_percentages();

    }

  };

  var ctrl_delete_item = function(event) {
    var item_id, split_id, type, ID;

    item_id = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(item_id) {

      split_id = item_id.split('-');
      type = split_id[0];
      ID = parseInt(split_id[1]);

      // 1. Delete the item from data structure
      budgetCtrl.delete_item(type, ID);

      // 2. Delete item from the UI
      uiCtrl.delete_list_item(item_id);

      // 3. Update and show the new budget
      update_budget();

      // 4. Calc and update percentages
      update_percentages();
    }

  };

  return {
    init: function() {
      console.log('App has started.');
      uiCtrl.display_month();
      uiCtrl.display_budget({
      budget: 0,
      total_inc: 0,
      total_exp: 0,
      percentage: -1
    });
      setup_event_listeners();
    }
  };
})(budget_controller, ui_controller);


controller.init();





















///
