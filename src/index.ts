import dotenv from 'dotenv';
import 'reflect-metadata';

import App from '@/app';

dotenv.config();
void App.listen();

