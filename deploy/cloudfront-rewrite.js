// CloudFront Function (runtime: cloudfront-js-2.0), event type: viewer-request.
//
// Serves the schema at extension-less URLs by rewriting them to the index.json
// object that publishSchema.sh uploads.
//
//   /transcripts/3.0               -> /transcripts/3.0/index.json   (schema)
//   /transcripts/3.0/              -> /transcripts/3.0/index.json
//   /transcripts/3.0/example.json  (unchanged — already a .json file)
//   /transcripts/3.0/context.json  (unchanged — already a .json file)
//
// All hosted objects are .json (index.json / example.json / context.json), so
// the rule is: if the request doesn't already end in ".json", it's a schema
// version path (e.g. /certificate-of-awards/1.0 — note the dot in the version)
// and should serve that folder's index.json.
//
// Attach to the distribution's default cache behavior as a viewer-request function.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith("/")) {
    request.uri = uri + "index.json";
  } else if (!uri.endsWith(".json")) {
    request.uri = uri + "/index.json";
  }

  return request;
}
