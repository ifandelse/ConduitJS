/**
 * ConduitJS - Give any method a pipeline....
 * Author: Jim Cowart (http://freshbrewedcode.com/jimcowart)
 * Version: v0.0.1
 * Url: http://github.com/ifandelse/ConduitJS
 * License: MIT
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory(root));
    } else {
        // Browser globals
        root.Conduit = factory(root);
    }
}(this, function (global, undefined) {
    return function (options) {
        if (typeof options.target !== "function") {
            throw new Error("You can can only call conduit.make on functions.");
        }
        var _steps = {
            pre: options.pre || [],
            post: options.post || [],
            all: []
        };
        var _context = options.context;
        var _targetStep = {
            isTarget: true,
            context: _context,
            fn: function (next) {
                var args = Array.prototype.slice.call(arguments, 1);
                options.target.apply(_context, args);
                next.apply(this, args);
            }
        };
        var _genPipeline = function () {
            _steps.all = _steps.pre.concat([_targetStep].concat(_steps.post));
        };
        _genPipeline();
        var conduit = function () {
            var idx = 0,
                self = this;
            var next = function next() {
                var args = Array.prototype.slice.call(arguments, 0);
                var thisIdx = idx;
                var step;
                idx += 1;
                if (thisIdx < _steps.all.length) {
                    step = _steps.all[thisIdx];
                    step.fn.apply(step.context || _context, [next].concat(args));
                }
            };
            next.apply(this, arguments);
        };
        conduit.target = options.target;
        conduit.context = function (ctx) {
            _context = ctx;
        };
        conduit.steps = function () {
            return _steps.all;
        };
        conduit.addStep = function (strategy, options) {
            strategy = typeof strategy === "function" ? {
                fn: strategy
            } : strategy;
            options = options || {};
            var phase = options.phase || "pre";
            if (options.prepend) {
                _steps[phase].unshift(strategy);
            } else {
                _steps[phase].push(strategy);
            }
            _genPipeline();
        };
        conduit.clear = function () {
            _steps = {
                pre: [],
                post: [],
                all: []
            };
        };
        return conduit;
    };
}));