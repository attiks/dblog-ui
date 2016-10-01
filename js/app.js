/**
 * @file
 * Dblog ui behaviors.
 */

(function (url, settings, store) {

  'use strict';

  Vue.component('pager', VuePager);

  var TableSortIndicator = Vue.extend({
    template: '#dblog-ui-table-sort-indicator',
    props: {
      order: null,
      default: false
    },
    computed: {
      show: function () {
        return this.$route.query.order ? this.$route.query.order == this.order : this.default;
      },
      sortClass: function () {
        return 'tablesort--' + (this.$route.query.sort == 'asc' ? 'desc' : 'asc');
      }
    }
  });

  Vue.component('table-sort-indicator', TableSortIndicator);

  var List = Vue.extend({

    template: '#dblog-ui-list',

    ready: function () {
      this.updateData();
    },

    data: function () {
      return {
        events: [],
        loading: false,
        totalPages: 1,
        type: [],
        typeOptions: [],
        severity: [],
        severityOptions: settings.severityLevels
      }
    },

    computed: {
      typePath: function () {
        return this.buildPath('type');
      },
      datePath: function () {
        return this.buildPath('date');
      },
      userPath: function () {
        return this.buildPath('user');
      }
    },

    watch: {
      '$route': 'updateData'
    },

    methods: {

      updateData: function () {
        this.loading = true;
        var that = this;
        store.getRecords(this.$route.query, function (data) {
          that.totalPages = Math.ceil(data.total / 50);
          that.typeOptions = data.typeOptions;
          that.events = data.data;
          that.loading = false;
        });
      },

      filter: function () {
        this.$router.go(this.buildPath());
      },

      buildPath: function (order) {

        var query = {};
        for (var param in this.$route.query) {
          if (this.$route.query.hasOwnProperty(param)) {
            query[param] = this.$route.query[param];
          }
        }

        if (order) {
          query.order = order;
          query.sort = !query.sort || query.sort == 'desc' ? 'asc' : 'desc';
        }

        query.type = this.type;
        query.severity = this.severity;

        return {
          path: '/',
          query: query
        }
      },

      reset: function () {
        this.type = [];
        this.severity = [];
        this.filter();
      },

      activeClass: function (order) {
        return this.$route.query.order == order ? 'is-active' : '';
      }
    }

  });

  var Details = Vue.extend({
    template: '#dblog-ui-details',

    ready: function () {
      var that = this;
      this.loading = true;
      store.getRecord(this.$route.params.eventId, function (data) {
        that.event = data;
        that.loading = false;
      });
    },

    data: function () {
      return {
        loading: false,
        severityLevels: settings.severityLevels,
        event: {}
      };
    }
  });

  var router = new VueRouter();
  router.map({
    '/': {
      component: List
    },
    '/event/:eventId': {
      name: 'details',
      component: Details
    }
  });

  var App = Vue.extend({});

  router.start(App, '#dblog-ui-app');

} (Drupal.url, drupalSettings.dblogUi, new DblogUiStore));
