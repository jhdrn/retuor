# retuor

A tiny Javascript router written in TypeScript.

## Example usage

```javascript

// Add a simple route
retuor.route('a/path', function() {
  console.log('a/path matched!');
  
  // Return true to let the path "fall through" to other routes.
  // In this case, the {*any}-route below would also be matched.
  return true;
});

// Add a route with wildcard and parameter
retuor.route('*/edit/{id}', function(id) {
  console.log('*/edit/' + id + ' matched!');
});

// Add a route with wildcard parameter
retuor.route('{*any}', function(any) {
  console.log('{*any} = ' + any);
});

// Set a base path 
retuor.setBasePath('blog/');

// Start route matching
retuor.run();
```
