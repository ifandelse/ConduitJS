/*global describe, it, after, before, expect */
(function() {
    var Conduit = typeof window === "undefined" ? require("../lib/conduit.js") : window.Conduit;
    var expect = typeof window === "undefined" ? require("expect.js") : window.expect;
    describe("ConduitJS", function() {
        describe("With an Async-Capable Pipeline", function() {
            describe("with NO steps in use", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg, cb) {
                        cb("Hi, " + this.name + " - " + msg);
                    }
                };
                before(function() {
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                });
                it("should return the expected value", function() {
                    obj.doStuff("here's your msg...", function(msg) {
                        expect(msg).to.be("Hi, Jimbabwe - here's your msg...");
                    });
                });
            });
            describe("with 'before' steps in use", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg, cb) {
                        cb("Hi, " + this.name + " - " + msg);
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(next, msg, cb) {
                            next("Yo dawg..." + msg, cb);
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    obj.doStuff("here's your msg...", function(msg) {
                        expect(msg).to.be("Hi, Jimbabwe - Yo dawg...here's your msg...");
                    });
                });
            });
            describe("with 'after' steps in use", function() {
                var results = [];
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function() {
                        results.push("original method invoked");
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.after({
                        fn: function(next, msg) {
                            results.push("after step invoked");
                            next();
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a step in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should execute the methods in the expected order", function() {
                    obj.doStuff();
                    expect(results[0]).to.be("original method invoked");
                    expect(results[1]).to.be("after step invoked");
                });
            });
            describe("with 'before' and 'after' steps in use", function() {
                var results = [];
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function() {
                        results.push("original method invoked");
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        fn: function(next, msg) {
                            results.push("before step invoked");
                            next();
                        }
                    });
                    obj.doStuff.after({
                        fn: function(next, msg) {
                            results.push("after step invoked");
                            next();
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show two steps in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(3);
                });
                it("should execute the methods in the expected order", function() {
                    obj.doStuff();
                    expect(results[0]).to.be("before step invoked");
                    expect(results[1]).to.be("original method invoked");
                    expect(results[2]).to.be("after step invoked");
                });
            });
            describe("when clearing steps", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg, cb) {
                        cb("Hi, " + this.name + " - " + msg);
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(next, msg) {
                            next("Yo dawg..." + msg);
                        }
                    });
                    obj.doStuff.clear();
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should NOT show a strategy in the array", function() {
                    expect(obj.doStuff.steps().length).to.be(1);
                });
                it("should return the expected value", function() {
                    it("should return the expected value", function() {
                        obj.doStuff("here's your msg...", function(msg) {
                            expect(msg).to.be("Hi, Jimbabwe - here's your msg...");
                        });
                    });
                });
            });
            describe("when providing a strategy-specific context", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg, cb) {
                        cb("Hi, " + this.name + " - " + msg);
                    }
                };
                var objB = {
                    name: "Your mom"
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(next, msg) {
                            next("Yo dawg..." + this.name + " says '" + msg + "'");
                        },
                        context: objB
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array along with target", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    it("should return the expected value", function() {
                        obj.doStuff("here's your msg...", function(msg) {
                            expect(msg).to.be("Hi, Jimbabwe - Yo dawg...Your mom says 'here's your msg...'");
                        });
                    });
                });
            });
            describe("with asynchronous steps", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg, cb) {
                        cb("Hi, " + this.name + " - " + msg);
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before(function(next, msg) {
                        setTimeout(function() {
                            next("Yo dawg..." + msg + "'");
                        }, 0);
                    });
                });
                it("should return the expected value", function() {
                    it("should return the expected value", function(done) {
                        obj.doStuff("here's your msg...", function(msg) {
                            expect(msg).to.be("Hi, Jimbabwe - Yo dawg...here's your msg...");
                            done();
                        });
                    });
                });
            });
            describe("when replacing the target with a new one", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg, cb) {
                        cb("Hi, " + this.name + " - " + msg);
                    }
                };
                var doStuffNew = function(msg, cb) {
                    cb("NEW: Hi, " + this.name + " - " + msg);
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Async({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(next, msg, cb) {
                            next("Yo dawg..." + this.name + " says '" + msg + "'", cb);
                        }
                    });
                    obj.doStuff.target(doStuffNew);
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array along with target", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    obj.doStuff("here's your msg...", function(msg) {
                        expect(msg).to.be("NEW: Hi, Jimbabwe - Yo dawg...Jimbabwe says 'here's your msg...'");
                    });
                });
            });
        });
        describe("With a Sync-only pipeline", function() {
            describe("with NO steps in use", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                before(function() {
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("Hi, Jimbabwe - here's your msg...");
                });
            });
            describe("with 'before' steps in use", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(returnVal, msg) {
                            return "Yo dawg..." + msg;
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    it("should return the expected value", function() {
                        expect(obj.doStuff("here's your msg...")).to.be("Hi, Jimbabwe - Yo dawg...here's your msg...");
                    });
                });
            });
            describe("with 'after' steps in use", function() {
                var results = [];
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function() {
                        results.push("original method invoked");
                        return "doStuff invoked";
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.after({
                        fn: function(retVal) {
                            results.push("after step invoked");
                            return retVal;
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a step in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should execute the methods in the expected order", function() {
                    expect(obj.doStuff()).to.be("doStuff invoked");
                    expect(results[0]).to.be("original method invoked");
                    expect(results[1]).to.be("after step invoked");
                });
            });
            describe("with 'before' and 'after' steps in use", function() {
                var results = [];
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function() {
                        results.push("original method invoked");
                        return "doStuff invoked";
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        fn: function(retVal) {
                            results.push("before step invoked");
                            return retVal;
                        }
                    });
                    obj.doStuff.after({
                        fn: function(retVal) {
                            results.push("after step invoked");
                            return retVal;
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show two steps in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(3);
                });
                it("should execute the methods in the expected order", function() {
                    expect(obj.doStuff()).to.be("doStuff invoked");
                    expect(results[0]).to.be("before step invoked");
                    expect(results[1]).to.be("original method invoked");
                    expect(results[2]).to.be("after step invoked");
                });
            });
            describe("when clearing steps", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(msg) {
                            return "Yo dawg..." + msg;
                        }
                    });
                    obj.doStuff.clear();
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should NOT show a strategy in the array", function() {
                    expect(obj.doStuff.steps().length).to.be(1);
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("Hi, Jimbabwe - here's your msg...");
                });
            });
            describe("when providing a strategy-specific context", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var objB = {
                    name: "Your mom"
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(msg) {
                            return ["Yo dawg..." + this.name + " says '" + msg + "'"];
                        },
                        context: objB
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array along with target", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("Hi, Jimbabwe - Yo dawg...Your mom says 'here's your msg...'");
                });
            });
            describe("When mutating the args in a before step", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(msg) {
                            return ["CONDUIT SEZ: " + msg];
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("Hi, Jimbabwe - CONDUIT SEZ: here\'s your msg...");
                });
            });
            describe("When mutating the value in an after step", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.after({
                        name: "test1",
                        fn: function(returnVal, msg) {
                            return "CONDUIT SEZ: " + returnVal;
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(2);
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("CONDUIT SEZ: Hi, Jimbabwe - here's your msg...");
                });
            });
            describe("When mutating the value in before and after steps", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.before({
                        name: "test1",
                        fn: function(msg) {
                            return ["CONDUIT SEZ BEFORE: " + msg];
                        }
                    });
                    obj.doStuff.after({
                        name: "test1",
                        fn: function(returnVal, msg) {
                            return returnVal + " CONDUIT SEZ AFTER";
                        }
                    });
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should show a strategy in the steps array (along with target method)", function() {
                    expect(obj.doStuff.steps().length).to.be(3);
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("Hi, Jimbabwe - CONDUIT SEZ BEFORE: here\'s your msg... CONDUIT SEZ AFTER");
                });
            });
            describe("when replacing the target with a new one", function() {
                var obj = {
                    name: "Jimbabwe",
                    doStuff: function(msg) {
                        return "Hi, " + this.name + " - " + msg;
                    }
                };
                var doStuffNew = function(msg) {
                    return "NEW: Hi, " + this.name + " - " + msg;
                };
                var oldMethod;
                before(function() {
                    oldMethod = obj.doStuff;
                    obj.doStuff = new Conduit.Sync({
                        target: obj.doStuff,
                        context: obj
                    });
                    obj.doStuff.target(doStuffNew);
                });
                it("should replace the method", function() {
                    expect(obj.doStuff).to.not.be(oldMethod);
                });
                it("should return the expected value", function() {
                    expect(obj.doStuff("here's your msg...")).to.be("NEW: Hi, Jimbabwe - here's your msg...");
                });
            });
        });
    });
}());