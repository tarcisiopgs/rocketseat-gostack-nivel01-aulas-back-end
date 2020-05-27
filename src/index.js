const express = require('express');
const cors = require('cors');
const app = express();
const { uuid, isUuid } = require('uuidv4');

app.use(cors());
app.use(express.json());

const repositories = [];

const logRequests = (req, res, next) => {
  const { method, url } = req;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
};

const validateRepositoryId = (req, res, next) => {
  const { params } = req;
  const { id } = params;

  if (!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid repository ID.' });
  }

  return next();
};

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

app.get('/repositories', (req, res) => {
  const { query } = req;
  const { title } = query;

  const results = title
    ? repositories.filter((repository) => repository.title.includes(title))
    : repositories;

  return res.json(results);
});

app.post('/repositories', (req, res) => {
  const { body } = req;
  const { title, url, techs, likes } = body;
  const project = { id: uuid(), title, url, techs, likes };

  repositories.push(project);

  return res.json(project);
});

app.put('/repositories/:id', (req, res) => {
  const { params, body } = req;
  const { id } = params;
  const { title, url, techs, likes } = body;
  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  const repository = { id, title, url, techs, likes };

  repositories[repositoryIndex] = repository;

  return res.json(repository);
});

app.post('/repositories/:id/like', (req, res) => {
  const { params} = req;
  const { id } = params;
  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  const repository = {...repositories[repositoryIndex], likes: repositories[repositoryIndex].likes + 1};

  repositories[repositoryIndex] = repository;

  return res.json(repository);
});

app.delete('/repositories/:id', (req, res) => {
  const { params } = req;
  const { id } = params;

  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  repositories.splice(repositoryIndex, 1);

  return res.status(204).send();
});

app.listen(8000, () => {
  console.log('🚀 Back-end started!');
});
