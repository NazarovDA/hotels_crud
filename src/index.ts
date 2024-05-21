import express from "express";
import { getHandler } from "./database";
import type { DBHandler } from "./database";
import { PostBody, PutBody, DeleteParams, GetParams } from "./types";
import { asyncHandler, errorHandler, notFound, validateRequestAsync } from "./middleware";

const app = express();
app.use(express.json());

const port = 8080;

app.get('/isAlive', (_, res) => {
  res.json({'isAlive': true});
});

app.post('/users', asyncHandler(validateRequestAsync({body: PostBody})), asyncHandler(async (req, res) => {
  res.status(201).json(await databaseHandler.create(req.body.name));
}));

app.get("/users/:id", asyncHandler(validateRequestAsync({params: GetParams})), asyncHandler(async (req, res) => {
  const result = await databaseHandler.read(req.params.id);
  if (!result) res.status(404).end();
  else res.json(result);
}));

app.get("/users", asyncHandler(async (_, res) => {
  res.json(await databaseHandler.read());
}));

app.put("/users/:id", asyncHandler(validateRequestAsync({body: PutBody, params: GetParams})), asyncHandler(async(req, res) => {
  const result = await databaseHandler.update(req.params.id, req.body.new_name);
  if (!result) res.status(404).end();
  else res.json(result);
}));

app.delete("/users/:id", asyncHandler(validateRequestAsync({params: DeleteParams})), asyncHandler(async (req, res) => {
  const result = await databaseHandler.delete(req.params.id);
  if (!result) res.status(404).end();
  else res.status(200).json(result);
}));

app.use(notFound);
app.use(errorHandler);

let databaseHandler: DBHandler;

app.listen(
  port,
  async () => {
    databaseHandler = await getHandler();
    await databaseHandler.createBase();
    console.log(`Server is running on ${port}`);
  }
);