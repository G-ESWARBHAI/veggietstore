export default function handler(req, res) {
  // This catches all routes and serves index.html for SPA routing
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Tailwind Animated Veggie Store</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
  `);
}

