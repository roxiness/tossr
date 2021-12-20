import { createReadStream } from "fs";
import http from "http";
import { join } from "path";

const mimeMap = {
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpg",
};

export const createAssetsServer = (path, port = 9091) => {
  return http
    .createServer((req, res) => {
      req.url = req.url === "/" ? "/index.html" : req.url;
      console.log("req", req.url);
      const stream = createReadStream(join(path, req.url));
      stream.on("error", function () {
        res.writeHead(404);
        res.end();
      });
      const ext = req.url.split(".").pop();
      res.writeHead(200, { "Content-Type": mimeMap[ext] || "text/html" });

      stream.pipe(res);
    })
    .listen(port);
};
