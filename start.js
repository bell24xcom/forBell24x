// start.js
import { app } from './server/index.ts';

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Bell24H server running on port ${port}`);
  console.log(`Access the application at: http://localhost:${port}`);
}); 