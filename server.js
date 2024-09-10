import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const app = express();

const SECRET_KEY = process.env.JWT_SECRET || 'Sua_JWT_chave_secreta';

app.use(express.json());

const gerarToken = ( user ) => {
        return jwt.sign({ id:user.id, email: user.email }, SECRET_KEY, { expiresIn: '5h'});
}

app.post('/register', async ( req, res ) => {

    const { name, email, password } = req.body;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { email: email }
        });
        
        if (existingUser) {
            return res.status(409).json({ error: "Email já está em uso" });
        }


        const hashedPassword = await bcrypt.hash( password, 10);
        const newUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword
        },
    })
        console.log("Um novo usuario foi adicionado no banco de dados.")
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        })

    } catch (error) {
        console.error('Erro ao registrar usuário: ' + error);
        res.status(500).json({ error: error.message + 'Erro interno no servidor.' })
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (!user) {
            res.status(404).json("Usuário não encontrado.");
            throw new Error('Usuário não encontrado."');
        }

        if(await bcrypt.compare(password, user.password)){
            const token = gerarToken(user)
            res.json({
                name: user.name,
                token: token
            });
            

            console.log("Um usuário acabou de Logar.")
        } else {
            res.status(401).json("Credenciais Inválidas.");
        }

    }catch (error){
        res.status(500).json({ error: error.message});
    }


})

const port = process.env.PORT ? Number(process.env.PORT) : 3333;
const host = '0.0.0.0';


app.listen(port, host, () => {
    console.log( "Servidor está rodando...")
})

