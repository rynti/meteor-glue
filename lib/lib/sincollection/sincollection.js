SinCollection = function(name) {
  if (!SinCollection.collections[name]) {
    SinCollection.collections[name] = new Meteor.Collection(name);
  }
  return SinCollection.collections[name];
};
SinCollection.collections = {};
