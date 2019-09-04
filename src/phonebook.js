import path from 'path';
import { promises as fs } from 'fs';

export default async () => {
  const data = await fs.readFile(path.resolve(__dirname, '../phonebook.txt'), 'utf-8');
  return data.toString()
    .trim()
    .split('\n')
    .reduce((acc, value) => {
      const [id, name, phone] = value.split('|').map(item => item.trim());
      acc[id] = { name, phone };
      return acc;
    }, {});
};

