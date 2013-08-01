/*!
 * Meteor Glue
 *
 * Copyright (c) 2013 Robert Böhm
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


this.glue = (function() {

  function createKeyValueObject(key, value) {
    var object = {};
    object[key] = value;
    return object;
  }

  var relations = {};
  /*
    {
      'books': {
        insertInto: ['comments']
      },
      'comments': {
        findIn: ['books']
      }
    }
   */

  var originalCollectionInsert = Meteor.Collection.prototype.insert;
  var originalCollectionFind = Meteor.Collection.prototype.find;
  var originalCollectionFindOne = Meteor.Collection.prototype.findOne;

  var injectCursor = function(Cursor) {
    var originalCursorFetch = Cursor.fetch;
    Cursor.fetch = function() {
      var selector = this._cursorDescription.selector;
      var child = this._cursorDescription.collectionName;
      if (relations[child] && selector) {
        for (var i = 0; i < relations[child].findIn.length; i++) {
          var parent = relations[child].findIn[i];
          if (selector[parent] && selector[parent][child]) {
            return selector[parent][child];
          }
        }
      }
      return originalCursorFetch.call(this);
    };
  }

  Meteor.Collection.prototype.insert = function(doc, callback) {
    var inserts = [];
    var child = this._name;
    if (relations[child] && doc) {
      _(relations[child].insertInto).each(function(target) {
        var target_id = null;
        if (doc[target]) target_id = doc[target]._id;
        if (doc[target + "_id"]) target_id = doc[target + "_id"];
        delete doc[target];
        delete doc[target + "_id"];
        if (target_id != null) {
          inserts.push({
            target: target,
            target_id: target_id,
            child: child,
            doc: doc
          });
        }
      }, this);
    }
    var id = originalCollectionInsert.call(this, doc, callback);
    doc._id = id;
    for (var i = 0; i < inserts.length; i++) {
      var insert = inserts[i];
      SinCollection(insert.target).update(insert.target_id, {$push: createKeyValueObject(insert.child, insert.doc)});
    }
    return id;
  };
  Meteor.Collection.prototype.find = function(selector, options) {
    var cursor = originalCollectionFind.call(this, selector, options);
    injectCursor(cursor);
    return cursor;
  };
  Meteor.Collection.prototype.findOne = function(selector, options) {
    var child = this._name;
    if (relations[child] && selector) {
      for (var i = 0; i < relations[child].findIn.length; i++) {
        var parent = relations[child].findIn[i];
        if (selector[parent] && selector[parent][child]) {
          return selector[parent][child];
        }
      }
    }
    return originalCollectionFindOne.call(this, selector, options);
  };

  var glue = function(parent) {
    return {
      hasMany: function(child) {
        if (!relations[child]) relations[child] = {insertInto: [], findIn: []};
        relations[child].findIn.push(parent);
        relations[child].insertInto.push(parent);
      }
    };
  };

  return glue;
})();
