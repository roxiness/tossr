import { render } from "../lib/index.js";


const devHTML = `
<!DOCTYPE html>
<html lang="en">
    <head>
  <script type="module" src="/@vite/client"></script>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <title>Svelte app</title>

        <!-- Google Fonts -->
        <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic"
        />

        <!-- CSS Reset -->
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css"
        />

        <!-- Milligram CSS -->
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.css"
        />

        <script type="module" async src="/src/main.js"></script>
    </head>

    <body></body>
</html>

`

console.time("start");
const html = await render({ url: "/", host: 'http://localhost:1337', html: devHTML, executeMode: 'native' });
// const html = await render({ url: "/", host: 'http://localhost:1337', htmlFile: "./dist/index.html", executeMode: 'native' });


console.timeEnd("start");

console.log({ html });
