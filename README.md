```javascript
const multipart = require('connect-multiparty')();
const heicToJpeg = require('heic-to-jpeg')();
const app = require('express')();
app.post('/upload', multipart, heicToJpeg, function(req, res) {
  // Access req.files as you normally would here.
  //
  // You will see `.jpg` where you would otherwise
  // see `.heic`.
});
```

This is middleware to convert the new iOS 11 HEIC/HEIF format to JPEG,
so that your Express route sees the JPEG as if it were the
original file.

This middleware expects that the file upload has already been
accepted via `connect-multiparty` or any other middleware that
provides a `req.files` object in which each sub-object has
`path`, `name` and `type` properties. The sub-objects of
`req.files` may also be arrays of such objects.

## Alternatives

The very latest versions of ImageMagick support HEIF too.

## Warnings

To prevent a denial of service, middleware that does CPU- and RAM-intensive
stuff like this should always be added only to the specific routes that
require it. It's also a good idea to use other middleware to check the user's
permissions first, rather than later in the route code itself.

## Changelog

2.0.0: Use [heic-convert](https://github.com/catdad-experiments/heic-convert) in replacement of [tifig](https://github.com/monostream/tifig).

1.0.2: supports more types of file upload middleware. In particular, the sub-objects of `req.files` may be arrays, and if `path` does not have any extension to change then a `.jpg` extension is added.

1.0.1: more docs, repo push.

1.0.0: initial release.
