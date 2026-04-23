import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

app.get('/v1/ping', (req, res) => res.json({ success: true, message: 'pong' }));

app.listen(port, () => {
  console.log(`SmartInvoice server started on http://localhost:${port}`);
});
