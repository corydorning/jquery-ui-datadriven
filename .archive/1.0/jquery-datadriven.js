/* jquery-datadriven.js
 *
 * Version: 1.0
 * Authored by: Cory Dorning
 * Website: http://corydorning.com/projects/datadriven
 * Source: https://github.com/corydorning/datadriven
 *
 * Dependencies: jQuery v1.9+, jQuery UI v1.10.x
 *
 * Last modified by: Cory Dorning
 * Last modified on: 04/23/2013
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

;(function($) {
  "use strict";

      // string split error prevention
  var splitString = function (str, sep, strArr) {
        var arr = strArr ? [] : null;

        if (str !== undefined) {
          if (str.toString().indexOf(sep) >= 0) {
            arr = str.split(sep);
          } else if (strArr) { // return array with original string instead of null
            arr.push(str);
          }
        }
        return arr;
      };

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
        animate: _element.data('ui-accordion-animate') || _this.options.animate, // ?
        collapsible: _element.data('ui-accordion-collapsible') || _this.options.collapsible,
        event: _element.data('ui-event') || _this.options.event,
        header: _element.data('ui-accordion-header') || _this.options.header, //?
        heightStyle: _element.data('ui-accordion-heightstyle') || _this.options.heightStyle,
        icons: {
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

    // get data source
      dataSource = _element.data('ui-autocomplete-source'),

    // data source defined? test if global var or split to array
      source = dataSource  && window[dataSource] || dataSource.split(','),

    // override options with data-*
      options = {
        appendTo: _element.data('ui-autocomplete-appendto') || _this.options.appendTo,
        autoFocus: _element.data('ui-autocomplete-autofocus') || _this.options.autoFocus, // ?
        delay: _element.data('ui-autocomplete-delay') || _this.options.delay,
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        minLength: _element.data('ui-autocomplete-minlength') || _this.options.minLength,
        position: {
          my: _element.data('ui-autocomplete-position-my') || _this.options.position.my,
          at: _element.data('ui-autocomplete-position-at') || _this.options.position.at,
          collision: _element.data('ui-autocomplete-position-collision') || _this.options.position.collision
        },
        source: source.length > 1 ? source : source[0]  // pass array or string
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original autocomplete _create
    _autocomplete.apply( _this, arguments );
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
        label: _element.data('ui-button-label') || _this.options.label,
        icons: {
          primary: _element.data('ui-icon-primary') || _this.options.icons.primary,
          secondary: _element.data('ui-icon-secondary') || _this.options.icons.secondary
        }
      };

    // store button text for loading buttons
    if (_element.data('ui-button-loading-text')) {
      _element.data('ui-button-original-text', _element.text());
    }

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original button _create
    _button.apply( _this, arguments );
  };


  // loading state for buttons
  $.ui.button.prototype.loading = function(){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element,

    // get loading text
      loadingText = _element.data('ui-button-loading-text') || 'Loading...';

    // submit form before disabling
    if (_element.is('[type="submit"]')) {
      _element.closest('form').submit();
    }

    // set loading state
    _element
      .button('disable')
      .find('.ui-button-text')
        .text(loadingText);

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

    // disabled?
      disabled = _element.hasClass('disabled'),

    // loading state?
      loading = _element.data('ui-buttonset-loading-text');


    if (disabled) {
      // make sure buttons have been setup
      _this.refresh();

      // set buttons to disabled
      _this.buttons.button( "option", "disabled", disabled );

    }

    // store button text for loading buttons
    if (loading) {
      _element
        .children('label')
          .each(function(){
            var $curr = $(this);
            $curr.data('ui-buttonset-original-text', $curr.text());
          });
    }

    // call the original buttonset _create
    _buttonset.apply( _this, arguments );
  };

  // loading state for buttons
  $.ui.buttonset.prototype.loading = function(ev){
    // current button object
    var _this = this,

    // current button element
      _element = _this.element,

    // get loading text
      loadingText = _element.data('ui-buttonset-loading-text') || 'Loading...';

    // disable buttonset
    _this.buttons.button( 'option', 'disabled', true );

    _element
      .find(ev.target)
        .text(loadingText);
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

        // set and get options to extend datepicke instances
        getOptions: function($target, inst) {
            // [0]: number of days, [1]: true/false = count only restricted / or all days, [2]: datepicker input selector
          var maxDate = splitString($target.data('ui-datepicker-maxdate'), ',', true),
              minDate = splitString($target.data('ui-datepicker-mindate'), ',', true),
              maxDateControl = $target.data('ui-datepicker-maxdate-control'),
              maxDateControlDays = splitString($target.data('ui-datepicker-maxdate-control-days'), ',', true),
              minDateControl = $target.data('ui-datepicker-mindate-control'),
              minDateControlDays = splitString($target.data('ui-datepicker-mindate-control-days'), ',', true),
              nonBusinessDays = $target.data('ui-datepicker-nonbusinessdays'),
              noWeekends = $target.data('ui-datepicker-noweekends'),

            // beforeShow function
              beforeShow = function(el, obj) {
                var currMaxdate = $(el).datepicker('option', 'maxDate'),
                    currMindate = $(el).datepicker('option', 'minDate'),
                    maxdateInput = maxDateControl && $(maxDateControl).datepicker('getDate'),
                    mindateInput = minDateControl && $(minDateControl).datepicker('getDate'),
                    maxdateAdd = parseInt(maxDateControlDays[0], 10),
                    mindateAdd = parseInt(minDateControlDays[0], 10),
                    maxdate = maxdateInput && maxdateAdd && maxDateControl[1] === 'true' ? businessDays(maxdateAdd, maxdateInput) : maxdateInput && maxdateAdd ?  new Date(maxdateInput.setDate(maxdateInput.getDate() + maxdateAdd)) : maxdateInput || currMaxdate,
                    mindate = mindateInput && mindateAdd && minDateControl[1] === 'true' ? businessDays(mindateAdd, mindateInput) : mindateInput && mindateAdd ? new Date(mindateInput.setDate(mindateInput.getDate() + mindateAdd)) : mindateInput || currMindate;

                // set date format for storing default max and min dates
                $(el).datepicker('option', 'dateFormat', 'mm/dd/yy');

                // set default max and min dates as data attribute
                $(el).data('default-maxdate', $(el).data('default-maxdate') === undefined ? currMaxdate : $(el).data('default-maxdate'));
                $(el).data('default-mindate', $(el).data('default-mindate') === undefined ? currMindate : $(el).data('default-mindate'));

                // make sure dynamic max and min dates don't exceed default max and min date range
                maxdate = maxdate > new Date($(el).data('default-maxdate')) || maxdate === null ? $(el).data('default-maxdate') : maxdate;
                mindate = mindate < new Date($(el).data('default-mindate')) ? $(el).data('default-mindate') : mindate;

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
            gotoCurrent: $target.data('ui-datepicker-gotocurrent') || inst.settings.gotoCurrent,
            maxDate: maxDate[1] === 'true' ? businessDays(maxDate[0]) : maxDate[0] !== undefined ? maxDate[0] : inst.settings.maxDate,
            minDate: minDate[1] === 'true' ? businessDays(minDate[0]) : minDate[0] !== undefined ? minDate[0] : inst.settings.minDate,
            numberOfMonths: $target.data('ui-datepicker-numberofmonths') || inst.settings.numberOfMonths,

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
        closeOnEscape: _element.data('ui-dialog-escape') || _this.options.closeOnEscape,
        closeText: _element.data('ui-dialog-closetext') || _this.options.closeText,
        dialogClass: _element.data('ui-dialog-class') || _this.options.dialogClass,
        draggable: _element.data('ui-dialog-draggable') || _this.options.draggable,
        height: _element.data('ui-dialog-height') || _this.options.height,
        maxHeight: _element.data('ui-dialog-maxheight') || _this.options.maxHeight,
        maxWidth: _element.data('ui-dialog-maxwidth') || _this.options.maxWidth,
        minHeight: _element.data('ui-dialog-minheight') || _this.options.minHeight,
        minWidth: _element.data('ui-dialog-minwidth') || _this.options.minWidth,
        modal: _element.data('ui-dialog-modal') || this.options.modal,
        resizable: !_element.data('ui-dialog-resizable') ? false : _this.options.resizable,
        title: _element.title ||  _element.data('ui-dialog-title') || _this.options.title,
        width: _element.data('ui-dialog-width') || _this.options.width
      },

      trigger = {
        el: _element.data('ui-trigger'),
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
        menus: _element.data('ui-accordion-header') || _this.options.menus,
        position: {
          my: _element.data('ui-position-my') || _this.options.position.my,
          at: _element.data('ui-position-at') || _this.options.position.at
        },
        role: _element.data('ui-role') || _this.options.role
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original menu _create
    _menu.apply( _this, arguments );
  };


  // =progressbar

  // keep original reference to the progressbar _create
  var _progressbar = $.ui.progressbar.prototype._create;

  $.ui.progressbar.prototype._create = function(){
    // current progressbar object
    var _this = this,

    // current progressbar element
      _element = _this.element,

    // override options with data-*
      options = {
        disabled: _element.hasClass('disabled') || _this.options.disabled,
        value: _element.data('ui-progressbar-value') || _this.options.value
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original progressbar _create
    _progressbar.apply( _this, arguments );
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
        range: _element.data('ui-slider-range') || _this.options.range, //?
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
        disable: _element.hasClass('disabled') || _this.options.disable,
        ajaxOptions: _element.data('ui-tabs-ajaxoptions') || _this.options.ajaxOptions, //?
        cache: _element.data('ui-tabs-cache') || _this.options.cache,
        collapsible: _element.data('ui-tabs-collapsible') || _this.options.collapsible,
        disabled: _element.data('ui-tabs-disabled') || _this.options.disabled,
        event: _element.data('ui-event') || _this.options.event,
        fx: _element.data('ui-tabs-fx') || _this.options.fx,
        idPrefix: _element.data('ui-tabs-idprefix') || _this.options.idPrefix,
        selected: _element.data('ui-tabs-selected') || _this.options.selected
      };

    // overwrite existing options with updated options
    $.extend(_this.options, options);

    // call the original tabs _create
    _tabs._create.apply( _this, arguments );
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
        hide:  _element.data('ui-tooltip-hdie') ||_this.options.hide,
        items: _element.data('ui-tooltip-items') || _this.options.items,
        popover: _element.data('role') === 'popover',
        position: {
          my: _element.data('ui-position-my') || _this.options.position.my,
          at: _element.data('ui-position-at') || _this.options.position.at,
          collision: _element.data('ui-position-collision') || _this.options.position.collision
        },
        show: _element.data('ui-tooltip-show') || _this.options.show,
        tooltipClass: _element.data('ui-tooltip-class') || _this.options.tooltipClass,
        track: _element.data('ui-tooltip-track') || _this.options.track
      };

    if (options.popover) {
      // set content to the title attribute
      options.content = _element.attr('title');

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


})(jQuery);
// end jQuery Datadriven plugin