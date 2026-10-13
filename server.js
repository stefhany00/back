const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DB_FILE = path.join(__dirname, 'db.json');

// ===============================
// MIDDLEWARES
// ===============================

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


// ===============================
// LER BANCO DE DADOS
// ===============================

function lerBancoDados() {

    if (!fs.existsSync(DB_FILE)) {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify({ alunos: [] }, null, 2)
        );

    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');

    return JSON.parse(data);
}


// ===============================
// SALVAR BANCO DE DADOS
// ===============================

function salvarBancoDados(data) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );

}


// ===============================
// CREATE - CADASTRAR ALUNO
// ===============================

app.post('/api/alunos', (req, res) => {

    const { nome, email, curso, rg, cpf, idade } = req.body;

    // Validação dos campos
    if (!nome || !email || !curso || !rg || !cpf || !idade) {

        return res.status(400).json({
            error: 'Todos os campos são obrigatórios.'
        });

    }

    const db = lerBancoDados();

    // Calcula o próximo ID
    // Ignora registros antigos que não possuem ID

    const nextId = db.alunos.length > 0
        ? Math.max(
            0,
            ...db.alunos.map(a => Number(a.id) || 0)
        ) + 1
        : 1;

    // Criar novo aluno
    const novoAluno = {
        id: nextId,
        nome,
        email,
        curso,
        rg,
        cpf,
        idade,
    };

    // Adicionar ao banco
    db.alunos.push(novoAluno);

    // Salvar no db.json
    salvarBancoDados(db);

    // Retornar aluno cadastrado
    res.status(201).json(novoAluno);

});


// ===============================
// READ - LISTAR ALUNOS
// ===============================

app.get('/api/alunos', (req, res) => {

    const db = lerBancoDados();

    res.json(db.alunos);

});


// ===============================
// UPDATE - EDITAR ALUNO
// ===============================

app.put('/api/alunos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const { nome, email, curso, rg, cpf, idade } = req.body;

    // Validar campos
    if (!nome || !email || !curso || !rg || !cpf || !idade) {

        return res.status(400).json({
            error: 'Todos os campos são obrigatórios.'
        });

    }

    const db = lerBancoDados();

    // Procurar aluno pelo ID
    const index = db.alunos.findIndex(
        a => a.id === id
    );

    if (index === -1) {

        return res.status(404).json({
            error: 'Aluno não encontrado.'
        });

    }

    // Atualizar dados
    db.alunos[index] = {
        ...db.alunos[index],
        nome,
        email,
        curso,
        rg,
        cpf,
        idade,
    };

    // Salvar alterações
    salvarBancoDados(db);

    res.json(db.alunos[index]);

});


// ===============================
// DELETE - EXCLUIR ALUNO
// ===============================

app.delete('/api/alunos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const db = lerBancoDados();

    // Procurar aluno
    const index = db.alunos.findIndex(
        a => a.id === id
    );

    if (index === -1) {

        return res.status(404).json({
            error: 'Aluno não encontrado.'
        });

    }

    // Remover aluno
    db.alunos.splice(index, 1);

    // Salvar alterações
    salvarBancoDados(db);

    res.status(204).send();

});


// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {

    console.log('================================');

    console.log(`Servidor rodando na porta ${PORT}`);

    console.log(`Acesse: http://localhost:${PORT}`);

    console.log('Banco de dados: db.json');

    console.log('================================');

});