/* jquery-datadriven.js
 *
 * Version: 2.2
 * Authored by: Cory Dorning
 * Website: http://corydorning.com/projects/datadriven
 * Source: https://github.com/corydorning/datadriven
 *
 * Dependencies: jQuery v1.9+, jQuery UI v1.10.x
 *
 * Last modified by: Cory Dorning
 * Last modified on: 11/05/2013
 *
 * Data-driven is a jQuery UI override (see 'Duck Punch' or 'Monkey Patch')
 * that extends the options of jQuery UI widgets to your HTML via the HTML5
 * data attribute.
 *
 * Options can be initiliazed/setup once in your JS file and can then be
 * defined/overridden in your mark-up on an individual basis, per each widget.
 *
 *
 * @TODO
 * = add data-binding to data attributes to allow for real time updating of
 *   widget options
 *
 */

// datadriven widget defaults
;(function($) {
  "use strict";

  // accordion
  $.ui.accordion.prototype.options.header = 'h3';

})(jQuery);


// datadriven special events
(function($) {
  "use strict";

  // throttled resize
  var throttle = 250,
      handler = function() {
      curr = ( new Date() ).getTime();
      diff = curr - lastCall;

      if ( diff >= throttle ) {

        lastCall = curr;
        $( this ).trigger( "throttledresize" );

      } else {

        if ( heldCall ) {
          clearTimeout( heldCall );
        }

        // Promise a held call will still execute
        heldCall = setTimeout( handler, throttle - diff );
      }
    },
    lastCall = 0,
    heldCall,
    curr,
    diff;

  $.event.special.throttledresize = {
    setup: function() {
      $( this ).bind( "resize", handler );
    },
    teardown: function() {
      $( this ).unbind( "resize", handler );
    }
  };

})(jQuery);


// datadriven widgets
(function($) {
  "use strict";

  // =accordion
  // keep original reference to the accordion _create
  var _accordion = $.ui.accordion.prototype._create;

  $.ui.accordion.prototype._create = function(){
    // current accordion object
    var _this = this,

    // current accordion element
      _element = _this.element,

    // override options with data-*
      options = {
        active: _element.data('ui-accordion-active') || _this.options.active,
        animate: !_element.data('ui-accordion-animate') ? _element.data('ui-accordion-animate') : _element.data('ui-accordion-animate') || _this.options.animate,
        collapsible: _element.data('ui-accordion-collapsible') || _this.options.collapsible,
        event: _element.data('ui-event') || _this.options.event,
        header: _element.data('ui-accordion-header') || _this.options.header, //?
        heightStyle: _element.data('ui-accordion-heightstyle') || _this.options.heightStyle,
        icons: _element.data('ui-icons') === false ? false : {
          activeHeader: _element.data('ui-icon-active') || _this.options.icons.activeHeader,
          header: _element.data('ui-icon-default') || _this.options.icons.header
        }
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original accordion _create
    _accordion.apply( _this, arguments );

    // disable accordion if needed
    if (_element.hasClass('disabled')) {
      _element.accordion({ disabled: true });
    }

    // activate section via selector
    if (_element.data('ui-accordion-activate')) {
      $(_element.data('ui-accordion-activate')).trigger(options.event);
    }
  };


  // =autocomplete

  // keep original reference to the autocomplete _create
  var _autocomplete = $.ui.autocomplete.prototype._create;

  $.ui.autocomplete.prototype._create = function(){
    // current autocomplete object
    var _this = this,

    // current autocomplete element
      _element = _this.element,

    // override options with data-*
      options = {
        autoFocus: _element.data('ui-autocomplete-autofocus') || _this.options.autoFocus, // ?
        delay: _element.data('ui-autocomplete-delay') || _this.options.delay,
        minLength: _element.data('ui-autocomplete-minlength') || _this.options.minLength,
        position: {
          my: _element.data('ui-position-my') || _this.options.position.my,
          at: _element.data('ui-position-at') || _this.options.position.at,
          collision: _element.data('ui-position-collision') || _this.options.position.collision
        },
        source: _element.data('ui-source')
      };

    // source reference not an array
    if (!(options.source instanceof Array)) {
      _element.on('focus', function() {
        var source = window[options.source] || $.ddui.helpers.stringToMethod(options.source);

        if (source) {
          $(_element).autocomplete( "option", "source", source);
        }
      });
    }


    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original autocomplete _create
    _autocomplete.apply( _this, arguments );

    // disable autcomplete if needed
    if (_element.hasClass('disabled')) {
      _element.autocomplete('disable');
    }

  };


  // =button
  // keep original reference to the button _create
  var _button = $.ui.button.prototype._create;

  $.ui.button.prototype._create = function(){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element,

    // override options with data-*
      options = {
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        text: _element.data('ui-button-text') || _this.options.text,
        icons: {
          primary: _element.data('ui-icon-primary') || _this.options.icons.primary,
          secondary: _element.data('ui-icon-secondary') || _this.options.icons.secondary
        },
        label: _element.data('ui-button-label') || _this.options.label,
        loading: _element.data('ui-loading-text')
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original button _create
    _button.apply( _this, arguments );

    // if loading button
    if (options.loading) {
      _element
        // store button text for loading buttons
        .data('ui-button-original-text', _element.text())

        // add loading event on click
        .on('click', function(){ $(this).button('loading'); });
    }

  };


  // loading state for buttons
  $.ui.button.prototype.loading = function(){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element;

    // submit form before disabling
    if (_element.is('[type="submit"]')) {
      _element.closest('form').submit();
    }

    // set loading state
    _element
      .button('disable')
      .find('.ui-button-text')
        .text(_this.options.loading);

  };

  // reset method for loading buttons
  $.ui.button.prototype.reset = function(){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element,

    // get loading text
      originalText = _element.data('ui-button-original-text');

    // enable and restore original text
    _element
      .button('enable')
      .find('.ui-button-text')
        .text(originalText);

  };


  // =buttonset

  // keep original reference to the buttonset _create
  var _buttonset = $.ui.buttonset.prototype._create;

  $.ui.buttonset.prototype._create = function() {
    // current buttonset object
    var _this = this,

    // current buttonset element
      _element = _this.element,

    // override options with data-*
      options = {
        disabled: _element.hasClass('disabled'),
        loading: _element.data('ui-loading-text')
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);


    if (options.disabled) {
      // make sure buttons have been setup
      _this.refresh();

      // set buttons to disabled
      _this.buttons.button( "option", "disabled", options.disabled );

    }

    // call the original buttonset _create
    _buttonset.apply( _this, arguments );

    // if loading button
    if (options.loading) {
      _element
        // add loading event on click
        .on('click', function(ev){ $(this).buttonset('loading', ev); })

        // store button text for loading buttons
        .children('label')
          .each(function(){
            var $curr = $(this);
            $curr.data('ui-buttonset-original-text', $curr.text());
          });
    }
  };

  // loading state for buttons
  $.ui.buttonset.prototype.loading = function(ev){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element;

    // disable buttonset
    _this.buttons.button( 'option', 'disabled', true );

    _element
      .find(ev.target)
        .text(_this.options.loading);
  };

  // reset method for loading buttons
  $.ui.buttonset.prototype.reset = function(ev){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element;

    // enable buttonset
    _this.buttons.button( 'option', 'disabled', false );

    // restore original text
    _element
      .find(ev.target)
        .text($(ev.target).parent().data('ui-buttonset-original-text'));

  };


  // =datepicker

  // keep original reference to the datepicker _connectDatepicker
  var _datepicker = {
    // ui methods
    _connect: $.datepicker.constructor.prototype._connectDatepicker,
    _inline: $.datepicker.constructor.prototype._inlineDatepicker,

    // custom determine date
    // taken from http://stackoverflow.com/questions/2885315/jquery-datepicker-getmindate-1d#answer-12220801
    _determineDate: function (dateAttr, dateVal) {
      var date = dateVal === undefined ? new Date() : new Date(dateVal),
        pattern = /([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
        matches = pattern.exec(dateAttr),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        newdate,

        daylightSavingAdjust = function (date){
          if (!date){
            return null;
          }
          date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
          return date;
        },

        getDaysInMonth = function (year, month){
          return 32 - daylightSavingAdjust(new Date(year, month, 32)).getDate();
        };

      while (matches) {
        switch (matches[2] || 'd') {
          case 'd' : case 'D' :
          day += parseInt(matches[1],10); break;
          case 'w' : case 'W' :
          day += parseInt(matches[1],10) * 7; break;
          case 'm' : case 'M' :
          month += parseInt(matches[1],10);
          day = Math.min(day, getDaysInMonth(year, month));
          break;
          case 'y': case 'Y' :
          year += parseInt(matches[1],10);
          day = Math.min(day, getDaysInMonth(year, month));
          break;
        }

        matches = pattern.exec(dateAttr);
      }

      newdate =  new Date(year, month, day);

      newdate.setHours(0);
      newdate.setMinutes(0);
      newdate.setSeconds(0);
      newdate.setMilliseconds(0);


      return daylightSavingAdjust(newdate);

    },

    // set and get options to extend datepicker instances
    getOptions: function($target, inst) {
      // [0]: number of days, [1]: true/false = count only restricted / or all days
      var maxDate = $.ddui.helpers.splitString($target.data('ui-datepicker-maxdate'), ',', true),
        minDate = $.ddui.helpers.splitString($target.data('ui-datepicker-mindate'), ',', true),

      // datepicker control selector
        maxDateControl = $target.data('ui-datepicker-maxdate-control'),
        minDateControl = $target.data('ui-datepicker-mindate-control'),

      // [0]: datepicker control offset, [1]: true/false = count only restricted / or all days
        maxDateControlDays = $.ddui.helpers.splitString($target.data('ui-datepicker-maxdate-control-days'), ',', true),
        minDateControlDays = $.ddui.helpers.splitString($target.data('ui-datepicker-mindate-control-days'), ',', true),

      // other dates to disable
        nonBusinessDays = $target.data('ui-datepicker-nonbusinessdays'),

      // disable weekends?
        noWeekends = $target.data('ui-datepicker-noweekends'),

      // beforeShow function
        beforeShow = function(el) {
          // get current max/min dates
          var defaultMaxdate = maxDate[0] !== undefined ? maxDate[0] instanceof Date ? maxDate[0] : _datepicker._determineDate(maxDate[0]) : null,
            defaultMindate = minDate[0] !== undefined ? minDate[0] instanceof Date ? minDate[0] : _datepicker._determineDate(minDate[0]) : null,

          // get dates on datepicker control
            maxdateInput = maxDateControl && $(maxDateControl).datepicker('getDate'),
            mindateInput = minDateControl && $(minDateControl).datepicker('getDate'),

          // get datepicker control offset
            maxdateAdd = parseInt(maxDateControlDays[0], 10),
            mindateAdd = parseInt(minDateControlDays[0], 10),

          // determine max/min date: (control && offset && restricted) or (control && offset) or (current max/min date)
            maxdate = maxdateInput && maxdateAdd && maxDateControlDays[1] === 'true' ? businessDays(maxdateAdd, maxdateInput) : maxdateInput && maxdateAdd ?  new Date(maxdateInput.setDate(maxdateInput.getDate() + maxdateAdd)) : maxdateInput,
            mindate = mindateInput && mindateAdd && minDateControlDays[1] === 'true' ? businessDays(mindateAdd, mindateInput) : mindateInput && mindateAdd ? new Date(mindateInput.setDate(mindateInput.getDate() + mindateAdd)) : mindateInput;

          // make sure dynamic max and min dates don't exceed original default max/min date range
          maxdate = defaultMaxdate && maxdate > new Date(defaultMaxdate) || !maxdate ? defaultMaxdate : maxdate;
          mindate = defaultMindate && mindate < new Date(defaultMindate) || !mindate ? defaultMindate : mindate;

          // set max and min date options
          $(this).datepicker('option', {
            maxDate: maxdate,
            minDate: mindate
          });
        },

      // beforeShowDay function
        beforeShowDay = noWeekends || nonBusinessDays ? _datepicker.restrictDays : inst.settings.beforeShowDay,

      // calculate min/max business days
        businessDays = function(days, date) {
          var today = date || new Date();

          while (days > 0){
            today.setDate(today.getDate() + 1);

            //check if current day is business day
            if (_datepicker.restrictDays.call($target, today)[0]) {
              days--;
            }
          }

          while (days < 0){
            today.setDate(today.getDate() - 1);

            //check if current day is business day
            if (_datepicker.restrictDays.call($target, today)[0]) {
              days++;
            }
          }

          return today;
        };

      // return options object
      return {
        disabled: $target.hasClass('disabled') || inst.settings.disabled,
        changeMonth: $target.data('ui-datepicker-changemonth') || inst.settings.changeMonth,
        changeYear: $target.data('ui-datepicker-changeyear') || inst.settings.changeYear,
        defaultDate: $target.data('ui-datepicker-defaultdate') || inst.settings.defaultDate,
        maxDate: maxDate[1] === 'true' ? businessDays(maxDate[0]) : maxDate[0] || inst.settings.maxDate,
        minDate: minDate[1] === 'true' ? businessDays(minDate[0]) : minDate[0] || inst.settings.minDate,
        numberOfMonths: $target.data('ui-datepicker-numberofmonths') || inst.settings.numberOfMonths,
        showButtonPanel: $target.data('ui-datepicker-showbuttonpanel') || inst.settings.showButtonPanel,

        // functions
        beforeShow: maxDateControl || minDateControl ? beforeShow : function() {},
        beforeShowDay: beforeShowDay
      };
    },


    // datepicker date restrictions
    restrictDays: function(date) {
      var $target = $(this),

        nonBusinessDays = $target.data('ui-datepicker-nonbusinessdays') ? $target.data('ui-datepicker-nonbusinessdays').split(',') : [],

        restrictDate = [],

        noWeekend = jQuery.datepicker.noWeekends(date),

        noBusinessDay = function(date) {
          var mm = date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1,
            dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
            yyyy = date.getFullYear(),
            formattedDate = mm + '/' + dd + '/' + yyyy;

          for (var i = 0, len = nonBusinessDays.length; i < len; i++) {
            if ($.inArray(formattedDate, nonBusinessDays) !== -1) {
              return [false];
            }
          }
          return [true];
        };

      if ($target.data('ui-datepicker-noweekends') && $target.data('ui-datepicker-nonbusinessdays')) { // no weekends and custom date
        restrictDate = noWeekend[0] ? noBusinessDay(date) : noWeekend;
      } else if ($target.data('ui-datepicker-noweekends')) { // no weekends
        restrictDate = noWeekend;
      } else { // no custom date
        restrictDate = noBusinessDay(date);
      }

      return restrictDate;

    }
  };


  // intercept _connectDatepicker
  $.datepicker.constructor.prototype._connectDatepicker = function(target, inst) {
    var _this = this;

    // overwrite existing settings with updated options
    $.extend(inst.settings, _datepicker.getOptions($(target), inst));

    // call the the attachDatepicker function
    _datepicker._connect.apply(_this, arguments );
  };

  // intercept _inlineDatepicker
  $.datepicker.constructor.prototype._inlineDatepicker = function(target, inst) {
    var _this = this;

    // overwrite existing settings with updated options
    $.extend(inst.settings, _datepicker.getOptions($(target), inst));

    // call the the attachDatepicker function
    _datepicker._inline.apply(_this, arguments );
  };


  // =dialog
  // keep original reference to the dialog _create
  var _dialog = $.ui.dialog.prototype._create;

  $.ui.dialog.prototype._create = function(){
    // current dialog object, set to href value if anchor
    var _this = this,

    // current dialog element
      _element = _this.element,

    // override options with data-*
      options = {
        appendTo: _element.data('ui-dialog-appendto') || _this.options.appendTo,
        autoOpen: _element.data('ui-dialog-autoopen') || false,
        closeOnEscape: _element.data('ui-dialog-escape') === false ? false : _this.options.closeOnEscape,
        closeText: _element.data('ui-dialog-closetext') || _this.options.closeText,
        dialogClass: _element.data('ui-dialog-class') || _this.options.dialogClass,
        draggable: _element.data('ui-dialog-draggable') === false ? false : _this.options.draggable,
        height: _element.data('ui-dialog-height') || _this.options.height,
        maxHeight: _element.data('ui-dialog-maxheight') || _this.options.maxHeight,
        maxWidth: _element.data('ui-dialog-maxwidth') || _this.options.maxWidth,
        minHeight: _element.data('ui-dialog-minheight') || _this.options.minHeight,
        minWidth: _element.data('ui-dialog-minwidth') || _this.options.minWidth,
        modal: _element.data('role') === 'modal' || this.options.modal,
        resizable: _element.data('ui-dialog-resizable') === false ? false : _this.options.resizable,
        title: _element.title || _this.options.title,
        width: _element.data('ui-dialog-width') || _this.options.width
      },

      trigger = {
        el: _element.data('ui-trigger') || '[href="#' + _element.attr('id') + '"]',
        delegate: _element.data('ui-trigger-delegate'),
        ev: _element.data('ui-event') || 'click',
        preventDefault: _element.data('ui-trigger-prevent-default') !== false
      };

    // create dialog event
    if (trigger.el) {

      // delegated or directly bound event
      $(trigger.delegate || trigger.el).on(trigger.ev, trigger.delegate ? trigger.el : null, function(e) {
        $(_element).dialog('open');

        if (trigger.preventDefault) {
          // prevent default action
          e.preventDefault();
        }
      });
    }

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original dialog _create
    _dialog.apply( _this, arguments );

  };



  // =menu
  // keep original reference to the menu _create
  var _menu = $.ui.menu.prototype._create;

  $.ui.menu.prototype._create = function(){
    // current menu object
    var _this = this,

    // current menu element
      _element = _this.element,

    // override options with data-*
      options = {
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        icons: {
          submenu: _element.data('ui-icon-default') || _this.options.icons.submenu
        },
        position: {
          my: _element.data('ui-position-my') || _this.options.position.my,
          at: _element.data('ui-position-at') || _this.options.position.at
        },
        role: _element.data('aria-role') || _this.options.role
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original menu _create
    _menu.apply( _this, arguments );

    // apply events to prevent menus from persisting
    $(_element).on('mouseleave', function() { $(this).menu( 'collapseAll', null, true ); });
  };


  // =progressbar

  // keep original reference to the progressbar _create
  var _progressbar = $.ui.progressbar.prototype._create;

  $.ui.progressbar.prototype._create = function(){
    // current progressbar object
    var _this = this,

    // current progressbar element
      _element = _this.element,

      value = _element.data('ui-progressbar-value'),

    // override options with data-*
      options = {
        value: value || _element.data('ui-progressbar-value') === false ? value : _this.options.value
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original progressbar _create
    _progressbar.apply( _this, arguments );

    if (_element.hasClass('disabled')) {
      _element.progressbar('disable');
    }
  };


  // =slider

  // keep original reference to the slider _create
  var _slider = $.ui.slider.prototype._create;

  $.ui.slider.prototype._create = function(){
    // current slider object
    var _this = this,

    // current slider element
      _element = _this.element,

    // override options with data-*
      options = {
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        animate: _element.data('ui-slider-animate') || _this.options.animate, //?
        max: _element.data('ui-slider-max') || _this.options.max,
        min: _element.data('ui-slider-min') || _this.options.min,
        orientation: _element.data('ui-slider-orientation') || _this.options.orientation,
        range: _element.data('ui-slider-range') || _this.options.range,
        step: _element.data('ui-slider-step') || _this.options.step,
        value: _element.data('ui-slider-value') || _this.options.value,
        values: _element.data('ui-slider-values') || _this.options.values //?
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original slider _create
    _slider.apply( _this, arguments );
  };


  // =spinner

  // keep original reference to the spinner _create
  var _spinner = $.ui.spinner.prototype._create;

  $.ui.spinner.prototype._create = function(){
    // current spinner object
    var _this = this,

    // current spinner element
      _element = _this.element,

    // override options with data-*
      options = {
        // requires Globalize.js dependency, so not supporting
        // culture: _element.data('ui-spinner-culture') || _this.options.culture,
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        icons: {
          down: _element.data('ui-icon-down') || _this.options.icons.down,
          up: _element.data('ui-icon-up') || _this.options.icons.up
        },
        incremental: _element.data('ui-spinner-incremental') || _this.options.incremental,
        max: _element.data('ui-spinner-max') || _this.options.max,
        min: _element.data('ui-spinner-min') || _this.options.min,
        numberFormat: _element.data('ui-spinner-format') || _this.options.numberFormat,
        page: _element.data('ui-spinner-page') || _this.options.page,
        step: _element.data('ui-spinner-step') || _this.options.step
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original spinner _create
    _spinner.apply( _this, arguments );
  };


  // =tabs

  // keep original reference to the slider _create
  var _tabs = {
        _create: $.ui.tabs.prototype._create,
        _refresh: $.ui.tabs.prototype._refresh
      };

  $.ui.tabs.prototype._create = function(){
    // current tabs object
    var _this = this,

    // current tabs element
      _element = _this.element,

    // override options with data-*
      options = {
        active: _element.data('ui-tabs-active') || _this.options.active,
        collapsible: _element.data('ui-tabs-collapsible') || _this.options.collapsible,
        disabled: _element.data('ui-disable') || _this.options.disabled,
        event: _element.data('ui-event') || _this.options.event
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original tabs _create
    _tabs._create.apply( _this, arguments );

    if (options.disabled) {
      _element.tabs('option', 'disabled', options.disabled);
    }
  };

  $.ui.tabs.prototype._refresh = function(){
    // current tabs object
    var _this = this,

        // current tabs element
        _element = _this.element;

    // vertical tabs?
    if (_element.data('ui-tabs-vertical')) {
      _element
        .addClass('vtabs')
        .children('.ui-tabs-panel')
        .css('min-height', _element.children('.ui-tabs-nav')[0].scrollWidth); // uses scrollWidth because the IE applied filters change the original width dimensions
    }

    // call the original tabs _refresh
    _tabs._refresh.apply( _this, arguments );
  };


  // =table
  $.widget('ui.table', {

    _version: 0.1,

    version: function() { return this._version; },

    // These options will be used as defaults
    options: {
      // widget element classes
      classes: {
        columnBtn: 'ui-table-columntoggle-btn',
        priorityPrefix: 'ui-table-priority-',
        columnToggleTable: 'ui-table-columntoggle'
      },

      // widget element ids
      ids: {
        menuPrefix: 'ui-table-menu-'
      },

      // column button menu text
      columnBtnText: 'Columns...'
    },

    // Set up the widget
    _create: function() {
      var _this = this,

          $table = $(_this.element).addClass(_this.options.classes.columnToggleTable),

          // get <th>s
          $ths = $table.children('thead').find('th'),

          // column counter
          coltally = 0;


      // loop through <th>s
      $ths.each(function() {
            // current <th>
        var $th = $(this),

            // if colspan get value
            colspan = parseInt($th.attr('colspan'), 10),

            // selector to get matching column cells
            sel = ':nth-child(' + ( coltally + 1 ) + ')',

            // init variables
            priorityClass, $toggle, $checkbox;

        // <th> is toggleable?
        if ($th.data('priority')) {
          // set priority class
          priorityClass = _this.options.classes.priorityPrefix + $th.data('priority');

          // create menu toggle
          $toggle = $('<li><label><input type="checkbox" checked /> ' + $(this).text() + '</label></li>');

          // get menu toggle checkbox
          $checkbox = $toggle.find(':checkbox');

          // create menu property array
          _this.menu = [];

          // <th> have colspan?
          if (colspan){
            // loop through colspans
            for (var j = 0; j < colspan - 1; j++ ){
              // increment column tally
              coltally++;

              // add column to selector
              sel += ', :nth-child(' + ( coltally + 1 ) + ')';
            }
          }

          // save reference to all cells in this <th>'s column on the checkbox via the 'cells' data-atrribute
          $checkbox.data('cells', $table.find('tr').children(sel).addClass(priorityClass));

          // save menu item
          _this.menuItems = _this.menuItems.add($toggle);
        }

        // increment column tally
        coltally++;

      }); // <th> each

      // menu items?
      if (_this.menuItems.length) {
        // build menu
        this._menu();
      }

      // window resize
      $(window).on('throttledresize', function() {_this.resizeUpdate.apply( _this, arguments ); });

    },

    // init menu items
    menuItems: $(),

    _menu: function() {
      var self = this,

          $table = $(self.element),

          menuID = self.options.ids.menuPrefix + self.uuid,

          // menu button
          $menu = $('<ul data-role="menu-button" data-ui-icon-default="ui-icon-carat-1-s" data-ui-position-at="bottom-1" id="' + menuID + '" class="' + self.options.classes.columnBtn + '">');


      $menu
        // append menu button
        .append('<li><a href="#' + menuID + '">' + ($table.data('ui-button-text') || self.options.columnBtnText) + '</a><ul></ul></li>')

        // append menu items
        .find('ul')
          .append(self.menuItems)
        .end()

        // create menu widget
        .menu()

        // bind change event to checkboxes
        .on('change', 'input', function() {
          if (this.checked) {
            $($(this).data('cells')).removeClass('ui-table-cell-hidden').addClass('ui-table-cell-visible');
          } else {
            $(this).data('cells').removeClass('ui-table-cell-visible').addClass('ui-table-cell-hidden');
          }
        })

        // add menu to the page
        .insertBefore($table);

    },

    resizeUpdate: function(){
      var _this = this;

      // loop through menuItems
      _this.menuItems.find('input').each( function(){
        // set checked based on responsive breakpoint and corresponding css display
        this.checked = $( this ).data('cells').eq(0).css( "display" ) === 'table-cell';
      });
    },

    // Use the _setOption method to respond to changes to options
    _setOption: function( key, value ) {
      switch( key ) {
        case "clear":
          // handle changes to clear option
          break;
      }

      // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
      $.Widget.prototype._setOption.apply( this, arguments );
      // In jQuery UI 1.9 and above, you use the _super method instead
      this._super( "_setOption", key, value );
    },

    // Use the destroy method to clean up any modifications your widget has made to the DOM
    destroy: function() {
      // In jQuery UI 1.8, you must invoke the destroy method from the base widget
      $.Widget.prototype.destroy.call( this );
      // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
    }
  });



  // =tooltip

  // keep original reference to the tooltip _create and _close
  var _tooltip = {
        fn: $.fn.tooltip,
        _create: $.ui.tooltip.prototype._create,
        close: $.ui.tooltip.prototype.close,
        open: $.ui.tooltip.prototype.open
      };

  $.ui.tooltip.prototype._create = function(){
    // current tooltip object
    var _this = this,

    // current tooltip element
      _element = _this.element,

    // override options with data-*
      options = {
        content: _element.data('ui-tooltip-content') || _this.options.content,
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        hide:  _element.data('ui-tooltip-hide') === false ? false : _element.data('ui-tooltip-hide') ||_this.options.hide,
        items: '[data-role="popover"], [data-role="tooltip"], [title]',
        popover: _element.data('role') === 'popover',
        position: {
          my: _element.data('ui-position-my') || _this.options.position.my,
          at: _element.data('ui-position-at') || _this.options.position.at,
          collision: _element.data('ui-position-collision') || _this.options.position.collision
        },
        show: _element.data('ui-tooltip-show') === false ? false : _element.data('ui-tooltip-show') || _this.options.show,
        tooltipClass: _element.data('ui-tooltip-class') || _this.options.tooltipClass,
        track: _element.data('ui-tooltip-track') || _this.options.track
      };

    if (options.popover) {
      // set content to the title attribute
      options.content = _element.data('ui-tooltip-content') || _element.attr('title');

      // target loses focus
      $(_element).on('blur', function() {
        // call the original tooltip close method
        _tooltip.close.apply( _this, arguments );
      });
    }

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original tooltip _create
    _tooltip._create.apply( _this, arguments );
  };

  // used for popovers
  $.ui.tooltip.prototype.close = function(event){
        // current tooltip object
    var _this = this,
        args = arguments,
        $target = $( event ? event.currentTarget : _this.element );

    if (_this.options.popover) {
      // capture click events on document
      $(document).on('click', function(evObj) {
        var $evObj = $(evObj.target),
            id = '#' + $target.data('ui-tooltip-id'),
            $tooltip = id ? $(id) : $();

        // click outside of target and tooltip?
        if (!$evObj.is($target) && !$evObj.is($tooltip) && !$evObj.parents(id).length) {
          // call the original tooltip close method
          _tooltip.close.apply( _this, args );
        }

      });

    } else {
      // call the original tooltip close method
      _tooltip.close.apply( _this, args );
    }

  };

  $.ui.tooltip.prototype.open = function(event){
        // current tooltip object
    var _this = this;

    $('[data-role="popover"], [data-role="tooltip"]').not(_this.element).trigger('blur');

    // call the original tooltip close method
    _tooltip.open.apply( _this, arguments );

  };


  // DataDriven JavaScript Helpers
  $.ddui = {
    helpers: {
      splitString: function (str, sep, strToArr) {
        var arr = strToArr ? [] : null;

        if (str !== undefined) {
          if (str.toString().indexOf(sep) >= 0) {
            arr = str.split(sep);
          } else if (strToArr) { // return array with original string instead of null
            arr.push(str);
          }
        }
        return arr;
      },

      stringToMethod: function (functionName, context) {
        // from: http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
        var namespaces = $.ddui.helpers.splitString(functionName, '.', true),
            func = namespaces.pop();

        for (var i = 0; i < namespaces.length; i++) {
          context = context ? context[namespaces[i]] : window[namespaces[i]];
        }

        return context[func];
      }
    },

    _init: function(sel) {
      if (sel) {
        // localized init
        $(sel)
          .find('[data-role]')
          .filter('[data-role*="accordion"]').accordion({ header: 'h3' })
          .end()
          .filter('[data-role*="autocomplete"]').autocomplete()
          .end()
          .filter('[data-role*="button"]').not('[data-role*="buttonset"], [data-role*="menu-button"]').button()
          .end().end()
          .filter('[data-role*="buttonset"]').buttonset()
          .end()
          .filter('[data-role*="datepicker"]').datepicker()
          .end()
          .filter('[data-role*="dialog"], [data-role*="modal"]').dialog()
          .end()
          .filter('[data-role*="menu"], [data-role*="menu-button"]').menu()
          .end()
          .filter('[data-role*="progressbar"]').progressbar()
          .end()
          .filter('[data-role*="slider"]').slider()
          .end()
          .filter('[data-role*="spinner"]').spinner()
          .end()
          .filter('[data-role*="tabs"]').tabs()
          .end()
          .filter('[data-role*="table"]').table()
          .end()
          .filter('[data-role*="tooltip"], [data-role*="popover"]').tooltip();

      } else {
        // global init
        $('[data-role]')
          .filter('[data-role*="accordion"]').accordion({ header: 'h3' })
          .end()
          .filter('[data-role*="autocomplete"]').autocomplete()
          .end()
          .filter('[data-role*="button"]').not('[data-role*="buttonset"], [data-role*="menu-button"]').button()
          .end().end()
          .filter('[data-role*="buttonset"]').buttonset()
          .end()
          .filter('[data-role*="datepicker"]').datepicker()
          .end()
          .filter('[data-role*="dialog"], [data-role*="modal"]').dialog()
          .end()
          .filter('[data-role*="menu"], [data-role*="menu-button"]').menu()
          .end()
          .filter('[data-role*="progressbar"]').progressbar()
          .end()
          .filter('[data-role*="slider"]').slider()
          .end()
          .filter('[data-role*="spinner"]').spinner()
          .end()
          .filter('[data-role*="tabs"]').tabs()
          .end()
          .filter('[data-role*="table"]').table()
          .end()
          .filter('[data-role*="tooltip"], [data-role*="popover"]').tooltip();
      }
    },

    // update defined widgets and rerender
    update: function(widgets, sel) {
      var widget = $.ddui.helpers.splitString(widgets, ' ', true);

      // update all
      if (widgets === 'all') {
        $.ddui._init(sel);
        return;
      }

      $.each(widget, function(i, v){

        if (sel) {
          $(sel)
            .find('[data-role="' + v + '"]')[v]();
        } else {
          $('[data-role="' + v + '"]')[v]();
        }
      });
    }

  };

  // kickoff the widgets
  $.ddui.update('all');

})(jQuery);
// end jQuery Datadriven plugin