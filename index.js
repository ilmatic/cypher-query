// Generated by CoffeeScript 1.6.3
(function() {
  "use strict";
  var CypherQuery, INVALID_IDEN, QUERY_PARTS, RESERVED, extend,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  extend = function(target, source) {
    var k, v;
    for (k in source) {
      v = source[k];
      target[k] = v;
    }
    return target;
  };

  RESERVED = ['start', 'create', 'set', 'delete', 'foreach', 'match', 'where', 'with', 'return', 'skip', 'limit', 'order', 'by', 'asc', 'desc', 'on', 'when', 'case', 'then', 'else', 'drop', 'using', 'merge', 'constraint', 'assert', 'scan', 'remove', 'union'];

  INVALID_IDEN = /\W/;

  QUERY_PARTS = ['start', 'match', 'where', 'with', 'set', 'delete', 'forach', 'return', 'union', 'union all', 'order by', 'limit', 'skip'];

  CypherQuery = (function() {
    var escape, k, part_builder, _i, _len;

    function CypherQuery(opt) {
      var key, val;
      if (typeof this === "undefined" || this === null) {
        return new CypherQuery(opt);
      }
      this._params = {};
      this._query = {};
      if (opt != null) {
        for (key in opt) {
          val = opt[key];
          this[key].apply(this, [].concat(val));
        }
      }
    }

    CypherQuery.prototype.toString = function() {
      var joiner, key, val;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = QUERY_PARTS.length; _i < _len; _i++) {
          key = QUERY_PARTS[_i];
          if (!((val = this._query[key]) != null)) {
            continue;
          }
          joiner = key === 'where' ? ' AND ' : ', ';
          _results.push(key.toUpperCase() + ' ' + val.join(joiner));
        }
        return _results;
      }).call(this)).join("\n");
    };

    CypherQuery.prototype.execute = function(db, cb) {
      return db.query(this.toString(), this._params, cb);
    };

    CypherQuery.prototype.compile = function(with_params) {
      var _this = this;
      if (!with_params) {
        return this.toString();
      } else {
        return this.toString().replace(/\{(\w+)\}/g, function(_, key) {
          return escape(_this._params[key] || (function() {
            throw new Error("Missing: " + key);
          })());
        });
      }
    };

    CypherQuery.prototype.params = function(params, val) {
      if (val != null) {
        this._params[params] = val;
        return this;
      } else if (params != null) {
        extend(this._params, params);
        return this;
      } else {
        return this._params;
      }
    };

    part_builder = function(key) {
      return function() {
        var vals, _ref;
        vals = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (typeof vals[vals.length - 1] !== 'string') {
          this.params(vals.pop());
        }
        if (this._query[key] == null) {
          this._query[key] = vals;
        } else {
          (_ref = this._query[key]).push.apply(_ref, vals);
        }
        return this;
      };
    };

    for (_i = 0, _len = QUERY_PARTS.length; _i < _len; _i++) {
      k = QUERY_PARTS[_i];
      CypherQuery.prototype[k] = part_builder(k);
    }

    CypherQuery.prototype.index = function(index, expr, params) {
      return this.start("n=" + index + "(" + expr + ")", params);
    };

    CypherQuery.prototype.autoindex = function(expr, params) {
      return this.index('node:node_auto_index', expr, params);
    };

    CypherQuery.install = function(target) {
      if (target == null) {
        target = require('neo4j/lib/GrpahDatabase');
      }
      return target.prototype.builder = function(opt) {
        var query;
        query = new CypherQuery(opt);
        query.execute = query.execute.bind(query, this);
        return query;
      };
    };

    CypherQuery.escape = escape = function(val) {
      switch (typeof val) {
        case 'boolean':
          return val != null ? val : {
            'true': 'false'
          };
        case 'number':
          return val;
        default:
          return '"' + (('' + val).replace(/"/g, '""')) + '"';
      }
    };

    CypherQuery.escape_identifier = function(name) {
      var _ref;
      if ((_ref = name.toLowerCase(), __indexOf.call(RESERVED, _ref) >= 0) || INVALID_IDEN.test(name)) {
        return '`' + (name.replace('`', '``')) + '`';
      } else {
        return name;
      }
    };

    return CypherQuery;

  })();

  module.exports = CypherQuery;

}).call(this);
