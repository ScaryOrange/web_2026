import fs from 'fs'
import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();
const port = 3000;
app.use(express.json());

app.get('/users', (req: Request, res: Response) => {
    fs.readFile('db.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка:', err);
            res.status(500);
            res.send('Error reading DB');
            return;
        }
        res.send(data);
    });
});

app.get('/user/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    fs.readFile('db.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка:', err);
            res.status(500).send('Error reading DB');
            return;
        }
        try {
            const users = JSON.parse(data);
            const user = users.find((u: any) => u.id === Number(id));
            if (!user) {
                res.status(404).send('Пользователь не найден');
                return;
            }
            res.send(user);
        } catch (e) {
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});

app.post('/user', (req: Request, res: Response) => {
    console.log(req.body);
    const newUser = req.body;

    fs.readFile('db.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка:', err);
            res.status(500).send('Error reading DB');
            return;
        }

        let users: any[] = [];
        try {
            users = data ? JSON.parse(data) : [];
        } catch (e) {
            users = [];
        }

        if (!newUser.id) {
            newUser.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        }
        users.push(newUser);

        fs.writeFile('db.txt', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Ошибка записи:', err);
                res.status(500).send('Error writing DB');
                return;
            }
            res.status(201).send(newUser);
        });
    });
});

app.patch('/user/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    fs.readFile('db.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка:', err);
            res.status(500).send('Error reading DB');
            return;
        }

        let users: any[] = [];
        try {
            users = data ? JSON.parse(data) : [];
        } catch (e) {
            res.status(500).send('Ошибка парсинга данных');
            return;
        }

        const index = users.findIndex((u: any) => u.id === Number(id));
        if (index === -1) {
            res.status(404).send('Пользователь не найден');
            return;
        }

        users[index] = { ...users[index], ...updates, id: users[index].id };

        fs.writeFile('db.txt', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Ошибка записи:', err);
                res.status(500).send('Error writing DB');
                return;
            }
            res.send(users[index]);
        });
    });
});

app.delete('/user/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    fs.readFile('db.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка:', err);
            res.status(500).send('Error reading DB');
            return;
        }

        let users: any[] = [];
        try {
            users = data ? JSON.parse(data) : [];
        } catch (e) {
            res.status(500).send('Ошибка парсинга данных');
            return;
        }

        const index = users.findIndex((u: any) => u.id === Number(id));
        if (index === -1) {
            res.status(404).send('Пользователь не найден');
            return;
        }

        const deletedUser = users.splice(index, 1)[0];

        fs.writeFile('db.txt', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Ошибка записи:', err);
                res.status(500).send('Error writing DB');
                return;
            }
            res.send(deletedUser);
        });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});