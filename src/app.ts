import express, { Application } from 'express';
import {connectDB} from './config/DatabaseConnect';
import userAuth from './routes/auth'
const app:Application = express();
const port = 3000;
connectDB();

app.use(express.json());
app.use('/api/v1/auth',userAuth);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});