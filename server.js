import createApp from './config/express.js';

const PORT = 3000;

createApp().then(app => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start the server:', err);
});
