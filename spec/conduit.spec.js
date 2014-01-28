/*global describe, it, after, before, expect */
(function() {
    var Conduit = typeof window === "undefined" ? require("../lib/conduit.js") : window.Conduit;
    var expect = typeof window === "undefined" ? require("expect.js") : window.expect;
    describe( "ConduitJS", function() {
        describe( "with NO steps in use", function() {
            var obj = {
                name    : "Jimbabwe",
                doStuff : function( msg, cb ) {
                    cb( "Hi, " + this.name + " - " + msg );
                }
            };
            before( function() {
                obj.doStuff = new Conduit( {
                    target   : obj.doStuff,
                    context  : obj
                } );
            } );
            it( "should return the expected value", function() {
                obj.doStuff( "here's your msg...", function( msg ) {
                    expect( msg ).to.be( "Hi, Jimbabwe - here's your msg..." );
                } );
            } );
        } );
        describe( "with steps in use", function() {
            var obj = {
                name    : "Jimbabwe",
                doStuff : function( msg, cb ) {
                    cb( "Hi, " + this.name + " - " + msg );
                }
            };
            var oldMethod;
            before( function() {
                oldMethod = obj.doStuff;
                obj.doStuff = new Conduit( {
                    target   : obj.doStuff,
                    context  : obj
                });
                obj.doStuff.addStep( {
                    name : "test1",
                    fn   : function( next, msg ) {
                        next( "Yo dawg..." + msg );
                    }
                });
            } );
            it( "should replace the method", function() {
                expect( obj.doStuff ).to.not.be( oldMethod );
            } );
            it( "should show a strategy in the steps array (along with target method)", function() {
                expect( obj.doStuff.steps().length ).to.be( 2 );
            } );
            it( "should return the expected value", function() {
                it( "should return the expected value", function() {
                    obj.doStuff( "here's your msg...", function( msg ) {
                        expect( msg ).to.be( "Hi, Jimbabwe - Yo dawg...here's your msg..." );
                    } );
                } );
            } );
        } );
        describe( "when clearing steps", function() {
            var obj = {
                name    : "Jimbabwe",
                doStuff : function( msg, cb ) {
                    cb( "Hi, " + this.name + " - " + msg );
                }
            };
            var oldMethod;
            before( function() {
                oldMethod = obj.doStuff;
                obj.doStuff = new Conduit( {
                    target  : obj.doStuff,
                    context : obj
                } );
                obj.doStuff.addStep( {
                    name : "test1",
                    fn   : function( next, msg ) {
                        next( "Yo dawg..." + msg );
                    }
                } );
                obj.doStuff.clear();
            } );
            it( "should replace the method", function() {
                expect( obj.doStuff ).to.not.be( oldMethod );
            } );
            it( "should NOT show a strategy in the array", function() {
                expect( obj.doStuff.steps().length ).to.be( 0 );
            } );
            it( "should return the expected value", function() {
                it( "should return the expected value", function() {
                    obj.doStuff( "here's your msg...", function( msg ) {
                        expect( msg ).to.be( "Hi, Jimbabwe - here's your msg..." );
                    } );
                } );
            } );
        } );
        describe( "when providing a strategy-specific context", function() {
            var obj = {
                name    : "Jimbabwe",
                doStuff : function( msg, cb ) {
                    cb( "Hi, " + this.name + " - " + msg );
                }
            };
            var objB = { name: "Your mom" };
            var oldMethod;
            before( function() {
                oldMethod = obj.doStuff;
                obj.doStuff = new Conduit( {
                    target  : obj.doStuff,
                    context : obj
                } );
                obj.doStuff.addStep( {
                    name : "test1",
                    fn   : function( next, msg ) {
                        next( "Yo dawg..." + this.name + " says '" + msg + "'");
                    },
                    context: objB
                } );
            } );
            it( "should replace the method", function() {
                expect( obj.doStuff ).to.not.be( oldMethod );
            } );
            it( "should show a strategy in the steps array along with target", function() {
                expect( obj.doStuff.steps().length ).to.be( 2 );
            } );
            it( "should return the expected value", function() {
                it( "should return the expected value", function() {
                    obj.doStuff( "here's your msg...", function( msg ) {
                        expect( msg ).to.be( "Hi, Jimbabwe - Yo dawg...Your mom says 'here's your msg...'" );
                    } );
                } );
            } );
        } );
        describe( "with asynchronous steps", function() {
            var obj = {
                name    : "Jimbabwe",
                doStuff : function( msg, cb ) {
                    cb( "Hi, " + this.name + " - " + msg );
                }
            };
            var oldMethod;
            before( function() {
                oldMethod = obj.doStuff;
                obj.doStuff = new Conduit( {
                    target  : obj.doStuff,
                    context : obj
                } );
                obj.doStuff.addStep(function( next, msg ) {
                    setTimeout(function() {
                        next( "Yo dawg..." + msg + "'");
                    }, 0);
                });
            } );
            it( "should return the expected value", function() {
                it( "should return the expected value", function(done) {
                    obj.doStuff( "here's your msg...", function( msg ) {
                        expect( msg ).to.be( "Hi, Jimbabwe - Yo dawg...here's your msg..." );
                        done();
                    } );
                } );
            } );
        });
    } );
}());