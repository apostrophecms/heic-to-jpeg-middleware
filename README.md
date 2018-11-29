```javascript
const multipart = require('connect-multiparty')();
const heicToJpeg = require('heic-to-jpeg-middleware')({tifig: '/opt/tifig'});
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
`path`, `name` and `type` properties.

[Requires the "tifig" command line utility. Install
that first.](https://github.com/monostream/tifig) You may specify its
path via `options.tifig`. If not it is assumed to be in the `PATH`
as `tifig`.

## Limitations

The `tifig` utility politely refuses to work on HEIF files
that didn't come from iOS 11. This is not a bug in the middleware.

## Alternatives

The very latest versions of ImageMagick support HEIF too.

## Warnings

To prevent a denial of service, middleware that does CPU- and RAM-intensive
stuff like this should always be added only to the specific routes that 
require it. It's also a good idea to use other middleware to check the user's
permissions first, rather than later in the route code itself.

## Changelog

1.0.1: more docs, repo push.

1.0.0: initial release.

