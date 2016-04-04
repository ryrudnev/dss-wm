import dev from './development';
import prod from './production';

export default process.env.NODE_ENV !== 'production' ? dev : prod;
