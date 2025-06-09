import express, { Application } from 'express';
import {connectDB} from './config/DatabaseConnect';
import userAuth from './features/auth/api/auth.routes'
import postRoute from './features/collaboration_feed/api/posts';
const app:Application = express();
const port = 3000;
connectDB();

app.use(express.json());
app.use('/api/v1/auth',userAuth);
app.use('/api/v1/posts',postRoute);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});